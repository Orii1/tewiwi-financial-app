const express = require('express');
const cors = require('cors');
require('dotenv').config();

const db = require('./src/config/db');

const app = express();
const PORT = process.env.PORT || 5000;
const transactionRoutes = require('./src/routes/transactionRoutes');

app.use(cors());
app.use(express.json());
app.use('/api/transactions', transactionRoutes);

// Endpoint Cek Kesehatan Server & Database
app.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT 1 + 1 AS solution');
    res.json({
      message: 'Backend Tewiwi Financial API Berjalan Normal!',
      db_status: 'Koneksi MySQL Berhasil',
      test_query: rows[0].solution
    });
  } catch (error) {
    res.status(500).json({
      message: 'Gagal terhubung ke database MySQL',
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server backend utama menyala di port ${PORT}`);
});