const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));

// Basic Health Check Route
app.get('/', (req, res) => {
  res.send('Udgam Merch Backend is running...');
});

// Render Keep-Alive Logic
// Pings its own health check endpoint every 10 minutes to prevent the server from sleeping.
const PING_INTERVAL = 10 * 60 * 1000; // 10 minutes
if (process.env.SERVER_URL) {
  setInterval(() => {
    fetch(process.env.SERVER_URL)
      .then(res => console.log(`[Keep-Alive] Pinged server successfully. Status: ${res.status}`))
      .catch(err => console.error(`[Keep-Alive] Ping failed:`, err.message));
  }, PING_INTERVAL);
}

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
