const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Route = require('./models/Route');
const User = require('./models/User');

dotenv.config();
const connectDB = require('./config/db');

const seedRoutes = async () => {
  try {
    await connectDB();
    const provider = await User.findOne({ role: 'provider' });
    if (!provider) {
      console.log('No provider found. Please create a provider user first.');
      return;
    }

    const routes = [
      { start: 'Nairobi', end: 'Mombasa', price: 1500, provider: provider._id },
      { start: 'Nairobi', end: 'Kisumu', price: 1200, provider: provider._id },
      { start: 'Nairobi', end: 'Eldoret', price: 1000, provider: provider._id },
      { start: 'Mombasa', end: 'Nairobi', price: 1500, provider: provider._id },
      { start: 'Kisumu', end: 'Nairobi', price: 1200, provider: provider._id },
      { start: 'Eldoret', end: 'Nairobi', price: 1000, provider: provider._id },
      { start: 'Nairobi', end: 'Nakuru', price: 800, provider: provider._id },
      { start: 'Nakuru', end: 'Nairobi', price: 800, provider: provider._id },
      { start: 'Nairobi', end: 'Thika', price: 500, provider: provider._id },
      { start: 'Thika', end: 'Nairobi', price: 500, provider: provider._id }
    ];

    await Route.insertMany(routes);
    console.log('Routes seeded successfully');
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedRoutes();