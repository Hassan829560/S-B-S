const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  route: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', required: true },
  selectedSeats: [{ seatNumber: String }],
  paymentStatus: { type: String, enum: ['paid', 'pending'], default: 'pending' },
  ticketCode: { type: String, default: null },
  ticketIssuedAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
