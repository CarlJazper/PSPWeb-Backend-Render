const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path'); // ← Add this

const connectDB = require('./config/dbConfig');
const userRoutes = require('./routes/userRoutes');
const clientRoutes = require('./routes/clientRoutes');
const exerciseRoutes = require('./routes/exerciseRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const branchRoutes = require('./routes/branchRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const availTrainerRoutes = require('./routes/availTrainerRoutes');
const logRoutes = require('./routes/logRoutes');

const app = express();
const port = process.env.PORT || 8000;

// Middleware 
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Connect to MongoDB
connectDB();


// API Routes
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/clients', clientRoutes);
app.use('/api/v1/branch', branchRoutes);
app.use('/api/v1/exercises', exerciseRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/transaction', transactionRoutes);
app.use('/api/v1/availTrainer', availTrainerRoutes);
app.use('/api/v1/logs', logRoutes);

app.use(express.static(path.join(__dirname, '../frontend/dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// Start server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
