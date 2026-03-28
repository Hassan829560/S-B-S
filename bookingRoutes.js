const express = require('express');
const Booking = require('../models/Booking');
const Route = require('../models/Route');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, async (req, res) => {
  const { routeId, selectedSeats } = req.body;

  if (!routeId || !selectedSeats || !Array.isArray(selectedSeats) || selectedSeats.length === 0) {
    return res.status(400).json({ message: 'routeId and selectedSeats are required.' });
  }

  try {
    const route = await Route.findById(routeId);
    if (!route) return res.status(404).json({ message: 'Route not found.' });

    // Check for seat conflicts
    const existingBookings = await Booking.find({ route: routeId });
    const occupiedSeats = existingBookings.flatMap(booking => booking.selectedSeats.map(seat => seat.seatNumber));
    const conflictingSeats = selectedSeats.filter(seat => occupiedSeats.includes(seat.seatNumber));

    if (conflictingSeats.length > 0) {
      return res.status(400).json({ message: `Seats already booked: ${conflictingSeats.map(s => s.seatNumber).join(', ')}` });
    }

    const booking = new Booking({
      user: req.user._id,
      route: route._id,
      selectedSeats,
      paymentStatus: 'pending'
    });

    await booking.save();
    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/', protect, async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      const bookings = await Booking.find().populate('route').populate('user', 'username email');
      return res.json(bookings);
    }

    if (req.user.role === 'provider') {
      const providerRoutes = await Route.find({ provider: req.user._id });
      const providerRouteIds = providerRoutes.map(route => route._id);
      const bookings = await Booking.find({ route: { $in: providerRouteIds } }).populate('route').populate('user', 'username email');
      return res.json(bookings);
    }

    const bookings = await Booking.find({ user: req.user._id }).populate('route').populate('user', 'username email');
    return res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/stats', protect, authorize('admin', 'provider'), async (req, res) => {
  try {
    let bookings;

    if (req.user.role === 'admin') {
      bookings = await Booking.find().populate('route');
    } else {
      const providerRoutes = await Route.find({ provider: req.user._id });
      const providerRouteIds = providerRoutes.map(route => route._id);
      bookings = await Booking.find({ route: { $in: providerRouteIds } }).populate('route');
    }

    const total = bookings.length;
    const paid = bookings.filter(b => b.paymentStatus === 'paid').length;
    const pending = bookings.filter(b => b.paymentStatus === 'pending').length;
    const revenue = bookings.reduce((sum, b) => sum + (b.paymentStatus === 'paid' ? b.route.price * b.selectedSeats.length : 0), 0);

    res.json({ total, paid, pending, revenue });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/:id/pay', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('route').populate('user', 'username email');
    if (!booking) return res.status(404).json({ message: 'Booking not found.' });
    if (booking.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not allowed.' });
    }

    if (booking.paymentStatus === 'paid') {
      return res.status(400).json({ message: 'Booking already paid.' });
    }

    booking.paymentStatus = 'paid';
    booking.ticketCode = `SALAMA-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    booking.ticketIssuedAt = new Date();

    await booking.save();
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/:id/mpesa', protect, async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ message: 'Phone number is required for MPESA payment.' });
  }

  try {
    const booking = await Booking.findById(req.params.id).populate('route').populate('user', 'username email');
    if (!booking) return res.status(404).json({ message: 'Booking not found.' });
    if (booking.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not allowed.' });
    }

    if (booking.paymentStatus === 'paid') {
      return res.status(400).json({ message: 'Booking already paid.' });
    }

    // Simulate MPESA transaction success.
    booking.paymentStatus = 'paid';
    booking.ticketCode = `SALAMA-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    booking.ticketIssuedAt = new Date();

    await booking.save();
    res.json({ booking, mpesa: { phone, status: 'success', transactionRef: `MPESA-${Date.now()}` } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id/ticket', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('route').populate('user', 'username email');
    if (!booking) return res.status(404).json({ message: 'Booking not found.' });
    if (booking.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not allowed.' });
    }

    if (booking.paymentStatus !== 'paid') {
      return res.status(400).json({ message: 'Payment required before ticket generation.' });
    }

    res.json({
      ticketCode: booking.ticketCode,
      issuedAt: booking.ticketIssuedAt,
      user: booking.user,
      route: booking.route,
      seats: booking.selectedSeats,
      totalAmount: booking.route.price * booking.selectedSeats.length,
      bookingId: booking._id,
      bookedAt: booking.createdAt
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found.' });

    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not allowed.' });
    }

    await booking.deleteOne();
    res.json({ message: 'Booking cancelled successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/route/:routeId', async (req, res) => {
  try {
    const bookings = await Booking.find({ route: req.params.routeId });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
