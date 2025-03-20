const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  date: { type: String, required: true }, // e.g., "2023-10-01"
  start_time: { type: String, required: true }, // e.g., "18:00"
  end_time: { type: String, required: true }, // e.g., "20:00"
  start_minutes: { type: Number, required: true }, // Minutes since midnight
  end_minutes: { type: Number, required: true },
  guests: { type: Number, required: true },
  customer_name: { type: String, required: true },
  customer_email: { type: String, required: true },
  customer_phone: { type: String, required: true },
  status: { type: String, default: 'pending', enum: ['pending', 'confirmed', 'canceled'] },
  table: { type: mongoose.Schema.Types.ObjectId, ref: 'Table', required: true },
});

module.exports = mongoose.model('Reservation', reservationSchema);