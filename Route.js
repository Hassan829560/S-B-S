const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
  start: { type: String, required: true },
  end: { type: String, required: true },
  price: { type: Number, required: true },
  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Route', routeSchema);
