const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');
const dotenv = require('dotenv');
const cors = require('cors'); // Import CORS

// Load environment variables from .env file
dotenv.config();

// Initialize Express app
const app = express();
const PORT = 5000; // Set backend port to 5000

// Middleware to parse JSON bodies
app.use(express.json());

// Set up CORS to allow requests from any origin
app.use(cors()); // Use default configuration, allowing all origins

// Set up Sequelize to connect to MySQL using environment variables
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'mysql',
  port: process.env.DB_PORT,
  logging: false, // Disable logging
});

// Define the Contact model
const Contact = sequelize.define('Contact', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true,
    },
  },
  telephone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  }
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt fields
});

// Test the database connection and sync the models
sequelize.authenticate()
  .then(() => {
    console.log('Connection to MySQL has been established successfully.');
    return sequelize.sync(); // Sync all models
  })
  .then(() => {
    console.log('All models were synchronized successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

// Define the route to handle contact form submissions
app.post('/api/contact', async (req, res) => {
  const { name, email, telephone, subject, message } = req.body;
  
  try {
    // Create a new contact entry
    const newContact = await Contact.create({ name, email, telephone, subject, message });
    res.status(201).json({ message: 'Contact form submitted successfully!', contact: newContact });
  } catch (error) {
    console.error('Error submitting contact form:', error);
    res.status(500).json({ message: 'Failed to submit contact form.', error });
  }
});

// Fetch messages route
app.get('/api/messages', async (req, res) => {
  try {
    // Retrieve all contact entries
    const contacts = await Contact.findAll();
    res.status(200).json(contacts);
  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).json({ message: 'An error occurred. Please try again.' });
  }
});

// Start the Express server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
