import { useState, useEffect } from 'react';
import { getTransactions, addTransaction, updateTransaction, deleteTransaction } from './services/api';
import { PlusCircle, Wallet, TrendingUp, TrendingDown, Calendar, FileText, Tag, DollarSign, Trash2, Edit3, X, Filter } from 'lucide-react';
import './App.css';

function App() {
  const [transactions, setTransactions] = useState([]);
  const [form, setForm] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    deskripsi: '',
    nominal: '',
    tipe_transaksi: 'Pengeluaran',
    kategori: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  // State untuk Filter Periode (Format: YYYY-MM, contoh: 2026-11)
  const [selectedMonth, setSelectedMonth] = useState('');

  const fetchTransactions = async () => {
    try {
      const response = await getTransactions();
      if (response.data.success) {
        setTransactions(response.data.data);
      }
    } catch (error) {
      console.error('Gagal memuat transaksi:', error);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTransactions();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'nominal') {
      // Hapus semua titik terlebih dahulu untuk mendapatkan angka murni
      const rawValue = value.replace(/\./g, '');
      // Format ulang dengan titik, lalu simpan ke state
      setForm({ ...form, [name]: formatRupiah(rawValue) });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Bersihkan titik pada nominal sebelum dikirim ke backend
      const submissionData = {
        ...form,
        nominal: form.nominal.toString().replace(/\./g, '')
      };

      if (isEditing) {
        await updateTransaction(editId, submissionData);
        alert('Transaksi berhasil diperbarui!');
      } else {
        await addTransaction(submissionData);
      }
      resetForm();
      fetchTransactions();
    } catch (error) {
      console.error('Gagal menyimpan transaksi:', error);
      alert('Terjadi kesalahan saat menyimpan transaksi.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (tx) => {
    setIsEditing(true);
    setEditId(tx.id);
    setForm({
      tanggal: tx.tanggal.split('T')[0],
      deskripsi: tx.deskripsi,
      nominal: tx.nominal,
      tipe_transaksi: tx.tipe_transaksi,
      kategori: tx.kategori
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Apakah kamu yakin ingin menghapus transaksi ini?')) {
      try {
        await deleteTransaction(id);
        fetchTransactions();
      } catch (error) {
        console.error('Gagal menghapus transaksi:', error);
        alert('Gagal menghapus transaksi.');
      }
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditId(null);
    setForm({
      tanggal: new Date().toISOString().split('T')[0],
      deskripsi: '',
      nominal: '',
      tipe_transaksi: 'Pengeluaran',
      kategori: ''
    });
  };

  // Logika Filter Transaksi berdasarkan Bulan (YYYY-MM)
  const filteredTransactions = transactions.filter(t => {
    if (!selectedMonth) return true; // Jika tidak dipilih, tampilkan semua
    const txMonth = t.tanggal.split('T')[0].slice(0, 7); // Ambil tahun-bulan (YYYY-MM)
    return txMonth === selectedMonth;
  });

  // Hitung ringkasan berdasarkan data yang difilter
  const totalPemasukan = filteredTransactions
    .filter(t => t.tipe_transaksi === 'Pemasukan')
    .reduce((acc, curr) => acc + Number(curr.nominal), 0);

  const totalPengeluaran = filteredTransactions
    .filter(t => t.tipe_transaksi === 'Pengeluaran')
    .reduce((acc, curr) => acc + Number(curr.nominal), 0);

  const saldoBersih = totalPemasukan - totalPengeluaran;

  // Fungsi untuk memformat angka dengan titik ribuan (contoh: 150000 -> 150.000)
  const formatRupiah = (value) => {
    if (!value) return '';
    const numberString = value.toString().replace(/[^,\d]/g, '');
    const split = numberString.split(',');
    let sisa = split[0].length % 3;
    let rupiah = split[0].substr(0, sisa);
    let ribuan = split[0].substr(sisa).match(/\d{3}/gi);

    if (ribuan) {
      let separator = sisa ? '.' : '';
      rupiah += separator + ribuan.join('.');
    }

    return split[1] !== undefined ? rupiah + ',' + split[1] : rupiah;
  };

  return (
    <div style={{ minHeight: '100vh', width: '100%', background: '#0f172a', color: '#f8fafc', padding: '30px 40px', boxSizing: 'border-box' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>

        {/* Header */}
        <header style={{ marginBottom: '35px', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: '#1e293b', padding: '8px 16px', borderRadius: '30px', marginBottom: '15px', border: '1px solid #334155' }}>
            <Wallet size={20} color="#38bdf8" />
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#38bdf8' }}>Tewiwi House Dashboard</span>
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', margin: '0 0 8px 0', background: 'linear-gradient(to right, #38bdf8, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Financial & Cash Flow Assistant
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '1rem', margin: 0 }}>
            Pencatatan keuangan F&B cerdas terintegrasi otomatis dengan Machine Learning
          </p>
        </header>

        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          <div style={{ background: '#1e293b', padding: '24px', borderRadius: '16px', border: '1px solid #334155' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ color: '#94a3b8', fontSize: '14px', fontWeight: '500' }}>Total Pemasukan</span>
              <TrendingUp color="#4ade80" size={22} />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#4ade80' }}>
              Rp {totalPemasukan.toLocaleString('id-ID')}
            </div>
          </div>

          <div style={{ background: '#1e293b', padding: '24px', borderRadius: '16px', border: '1px solid #334155' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ color: '#94a3b8', fontSize: '14px', fontWeight: '500' }}>Total Pengeluaran</span>
              <TrendingDown color="#f87171" size={22} />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#f87171' }}>
              Rp {totalPengeluaran.toLocaleString('id-ID')}
            </div>
          </div>

          <div style={{ background: '#1e293b', padding: '24px', borderRadius: '16px', border: '1px solid #334155' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ color: '#94a3b8', fontSize: '14px', fontWeight: '500' }}>Saldo Kas Bersih</span>
              <Wallet color="#38bdf8" size={22} />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: '700', color: saldoBersih >= 0 ? '#38bdf8' : '#f87171' }}>
              Rp {saldoBersih.toLocaleString('id-ID')}
            </div>
          </div>
        </div>

        {/* Form Tambah / Edit Transaksi */}
        <div style={{ background: '#1e293b', padding: '30px', borderRadius: '16px', marginBottom: '35px', border: '1px solid #334155' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #334155', paddingBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <PlusCircle color="#38bdf8" size={22} />
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '600' }}>
                {isEditing ? 'Edit Transaksi' : 'Form Pencatatan Transaksi'}
              </h3>
            </div>
            {isEditing && (
              <button onClick={resetForm} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
                <X size={16} /> Batal Edit
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '25px' }}>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>
                <Calendar size={15} /> Tanggal
              </label>
              <input
                type="date"
                name="tanggal"
                value={form.tanggal}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #475569', background: '#0f172a', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>
                <Tag size={15} /> Tipe Transaksi
              </label>
              <select
                name="tipe_transaksi"
                value={form.tipe_transaksi}
                onChange={handleChange}
                style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #475569', background: '#0f172a', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
              >
                <option value="Pengeluaran">Pengeluaran</option>
                <option value="Pemasukan">Pemasukan</option>
              </select>
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>
                <FileText size={15} /> Deskripsi Keterangan
              </label>
              <input
                type="text"
                name="deskripsi"
                placeholder="Contoh: Beli Tepung Terigu 1kg / Penjualan Menu Harian"
                value={form.deskripsi}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #475569', background: '#0f172a', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>
                <DollarSign size={15} /> Nominal (Rp)
              </label>
              <input
                type="text"
                name="nominal"
                placeholder="Contoh: 150.000"
                value={form.nominal}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #475569', background: '#0f172a', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button
                type="submit"
                disabled={loading}
                style={{ width: '100%', background: isEditing ? 'linear-gradient(to right, #f59e0b, #d97706)' : 'linear-gradient(to right, #0ea5e9, #6366f1)', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: '600', fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(14, 165, 233, 0.3)' }}
              >
                {loading ? 'Menyimpan...' : isEditing ? 'Perbarui Transaksi' : 'Simpan Transaksi'}
              </button>
            </div>
          </form>
        </div>

        {/* Tabel Riwayat Transaksi dengan Filter Periode Profesional */}
        <div style={{ background: '#1e293b', borderRadius: '16px', border: '1px solid #334155', overflow: 'hidden' }}>
          <div style={{ padding: '20px 30px', borderBottom: '1px solid #334155', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '20px' }}>
            <div>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '1.2rem', fontWeight: '600' }}>Riwayat Transaksi</h3>
              <span style={{ fontSize: '13px', color: '#94a3b8' }}>
                Menampilkan {filteredTransactions.length} dari total {transactions.length} transaksi
              </span>
            </div>

            {/* Filter Periode yang Lebih Profesional */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#0f172a', padding: '6px 12px', borderRadius: '10px', border: '1px solid #475569' }}>
                <Filter size={15} color="#38bdf8" />
                <span style={{ fontSize: '13px', color: '#cbd5e1', fontWeight: '500' }}>Periode:</span>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '13px', outline: 'none', cursor: 'pointer' }}
                />
              </div>

              {selectedMonth && (
                <button
                  onClick={() => setSelectedMonth('')}
                  style={{ background: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.3)', color: '#38bdf8', padding: '7px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', transition: 'background 0.2s' }}
                >
                  Reset Filter
                </button>
              )}
            </div>
          </div>

          <div style={{ overflowX: 'auto', width: '100%' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px', minWidth: '700px' }}>
              <thead>
                <tr style={{ background: '#0f172a', color: '#94a3b8', borderBottom: '1px solid #334155' }}>
                  <th style={{ padding: '16px 24px', fontWeight: '600' }}>Tanggal</th>
                  <th style={{ padding: '16px 24px', fontWeight: '600' }}>Tipe</th>
                  <th style={{ padding: '16px 24px', fontWeight: '600' }}>Deskripsi</th>
                  <th style={{ padding: '16px 24px', fontWeight: '600' }}>Kategori (AI)</th>
                  <th style={{ padding: '16px 24px', fontWeight: '600', textAlign: 'right' }}>Nominal</th>
                  <th style={{ padding: '16px 24px', fontWeight: '600', textAlign: 'center' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                      Tidak ada data transaksi pada periode ini.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx) => (
                    <tr key={tx.id} style={{ borderBottom: '1px solid #334155' }}>
                      <td style={{ padding: '16px 24px', color: '#cbd5e1' }}>{tx.tanggal.split('T')[0]}</td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', background: tx.tipe_transaksi === 'Pemasukan' ? 'rgba(74, 222, 128, 0.15)' : 'rgba(248, 113, 113, 0.15)', color: tx.tipe_transaksi === 'Pemasukan' ? '#4ade80' : '#f87171' }}>
                          {tx.tipe_transaksi}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px', fontWeight: '500', color: '#f8fafc' }}>{tx.deskripsi}</td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{ background: '#334155', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', color: '#38bdf8', fontWeight: '500' }}>
                          {tx.kategori}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px', textAlign: 'right', fontWeight: '700', color: tx.tipe_transaksi === 'Pemasukan' ? '#4ade80' : '#f87171' }}>
                        Rp {Number(tx.nominal).toLocaleString('id-ID')}
                      </td>
                      <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          <button onClick={() => handleEdit(tx)} style={{ background: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.3)', color: '#38bdf8', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer' }} title="Edit">
                            <Edit3 size={15} />
                          </button>
                          <button onClick={() => handleDelete(tx.id)} style={{ background: 'rgba(248, 113, 113, 0.15)', border: '1px solid rgba(248, 113, 113, 0.3)', color: '#f87171', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer' }} title="Hapus">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;