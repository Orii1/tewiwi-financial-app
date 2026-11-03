const db = require('../config/db');
const axios = require('axios');

// Ambil semua data transaksi
exports.getAllTransactions = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM transactions ORDER BY tanggal DESC');
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Tambah transaksi baru (dengan integrasi ML FastAPI untuk Pengeluaran)
exports.createTransaction = async (req, res) => {
  try {
    let { tanggal, deskripsi, nominal, tipe_transaksi, kategori } = req.body;

    // Jika tipe transaksi adalah Pengeluaran dan kategori belum diisi, minta bantuan ML FastAPI
    if (tipe_transaksi === 'Pengeluaran' && (!kategori || kategori === '')) {
      try {
        const mlResponse = await axios.post('http://127.0.0.1:8000/predict-category', {
          deskripsi: deskripsi
        });
        kategori = mlResponse.data.kategori_prediksi;
      } catch (mlError) {
        console.error('Gagal menghubungi layanan ML:', mlError.message);
        kategori = 'Lainnya'; // Fallback jika layanan ML sedang offline
      }
    } else if (tipe_transaksi === 'Pemasukan') {
      kategori = 'Penjualan';
    }

    const query = 'INSERT INTO transactions (tanggal, deskripsi, nominal, tipe_transaksi, kategori) VALUES (?, ?, ?, ?, ?)';
    const [result] = await db.query(query, [tanggal, deskripsi, nominal, tipe_transaksi, kategori]);

    res.status(201).json({
      success: true,
      message: 'Transaksi berhasil ditambahkan!',
      data: {
        id: result.insertId,
        tanggal,
        deskripsi,
        nominal,
        tipe_transaksi,
        kategori
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};