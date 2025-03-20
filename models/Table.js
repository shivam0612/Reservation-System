const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
  table_number: { type: String, required: true },
  capacity: { type: Number, required: true },
});

module.exports = mongoose.model('Table', tableSchema);