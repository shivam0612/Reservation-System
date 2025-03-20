const express = require('express');
const Reservation = require('../models/Reservation');
const Table = require('../models/Table');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Helper function to convert time to minutes
function timeToMinutes(time) {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

module.exports = (io) => {
  // Create Reservation (Public)
  router.post('/', async (req, res) => {
    const { date, start_time, guests, customer_name, customer_email, customer_phone } = req.body;
    const start_minutes = timeToMinutes(start_time);
    const end_minutes = start_minutes + 120; // Fixed 2-hour duration

    // Find available tables
    const tables = await Table.find({ capacity: { $gte: guests } });
    let assignedTable = null;

    for (const table of tables) {
      const overlapping = await Reservation.findOne({
        date,
        table: table._id,
        start_minutes: { $lt: end_minutes },
        end_minutes: { $gt: start_minutes },
      });
      if (!overlapping) {
        assignedTable = table;
        break;
      }
    }

    if (!assignedTable) {
      return res.status(400).json({ message: 'No tables available' });
    }

    const endTime = `${String(Math.floor(end_minutes / 60)).padStart(2, '0')}:${String(end_minutes % 60).padStart(2, '0')}`;
    const reservation = new Reservation({
      date,
      start_time,
      end_time: endTime,
      start_minutes,
      end_minutes,
      guests,
      customer_name,
      customer_email,
      customer_phone,
      table: assignedTable._id,
    });

    await reservation.save();
    const populatedReservation = await Reservation.findById(reservation._id).populate('table');
    io.emit('newReservation', populatedReservation);
    res.status(201).json(populatedReservation);
  });

  // Get All Reservations (Protected)
  router.get('/', protect, async (req, res) => {
    const reservations = await Reservation.find().populate('table');
    res.json(reservations);
  });

  // Update Reservation (Protected)
  router.put('/:id', protect, async (req, res) => {
    const reservation = await Reservation.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('table');
    if (!reservation) return res.status(404).json({ message: 'Reservation not found' });
    io.emit('updateReservation', reservation);
    res.json(reservation);
  });

  // Delete Reservation (Protected)
  router.delete('/:id', protect, async (req, res) => {
    const reservation = await Reservation.findByIdAndDelete(req.params.id);
    if (!reservation) return res.status(404).json({ message: 'Reservation not found' });
    io.emit('deleteReservation', req.params.id);
    res.json({ message: 'Reservation deleted' });
  });

  return router;
};