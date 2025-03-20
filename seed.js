const mongoose = require('mongoose');
const Table = require('./models/Table');
const User = require('./models/User');
const bcrypt = require('bcrypt');
const dotenv = require("dotenv");

dotenv.config();
async function seed() {
  try {

    // console.log("asddddddddddddddddddddddd" + process.env.DATABASE_URL)

    // Connect to MongoDB
    await mongoose.connect(process.env.DATABASE_URL);
    console.log('Connected to MongoDB');

    // Seed tables
    await Table.deleteMany({}); // Clear existing tables
    await Table.insertMany([
      { table_number: 'T1', capacity: 2 },
      { table_number: 'T2', capacity: 4 },
      { table_number: 'T3', capacity: 6 },
    ]);
    console.log('Tables seeded');

    // Seed admin user
    await User.deleteMany({}); // Clear existing users
    const hashedPassword = await bcrypt.hash('admin123', 10); // Hash the password
    await User.create({ username: 'admin', password: hashedPassword });
    console.log('Admin user seeded');

    // Close the connection
    await mongoose.connection.close();
    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

seed();