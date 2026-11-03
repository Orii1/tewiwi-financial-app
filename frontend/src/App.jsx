import { useState, useEffect } from 'react';
import { getTransactions, addTransaction } from './services/api';
import { PlusCircle, Wallet, TrendingUp, TrendingDown, Calendar, FileText, Tag, DollarSign } from 'lucide-react';
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
  const [loading, setLoading] = useState(false);

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
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addTransaction(form);
      setForm({
        tanggal: new Date().toISOString().split('T')[0],
        deskripsi: '',
        nominal: '',
        tipe_transaksi: 'Pengeluaran',
        kategori: ''
      });
      fetchTransactions();
    } catch (error) {
      console.error('Gagal menambah transaksi:', error);
      alert('Terjadi kesalahan saat menyimpan transaksi.');
    } finally {
      setLoading(false);
    }
  };

  // Hitung ringkasan total
  const totalPemasukan = transactions
    .filter(t => t.tipe_transaksi === 'Pemasukan')
    .reduce((acc, curr) => acc + Number(curr.nominal), 0);

  const totalPengeluaran = transactions
    .filter(t => t.tipe_transaksi === 'Pengeluaran')
    .reduce((acc, curr) => acc + Number(curr.nominal), 0);

  const saldoBersih = totalPemasukan - totalPengeluaran;

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#f8fafc', padding: '40px 20px', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Header */}
        <header style={{ marginBottom: '35px', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: '#1e293b', padding: '8px 16px', borderRadius: '30px', marginBottom: '15px', border: '1px solid #334155' }}>
            <Wallet size={20} color="#38bdf8" />
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#38bdf8' }}>Tewiwi House Dashboard</span>
          </div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: '800', margin: '0 0 8px 0', background: 'linear-gradient(to right, #38bdf8, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Financial & Cash Flow Assistant
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '1rem', margin: 0 }}>
            Pencatatan keuangan F&B cerdas terintegrasi otomatis dengan Machine Learning
          </p>
        </header>

        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ color: '#94a3b8', fontSize: '14px', fontWeight: '500' }}>Total Pemasukan</span>
              <TrendingUp color="#4ade80" size={20} />
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#4ade80' }}>
              Rp {totalPemasukan.toLocaleString('id-ID')}
            </div>
          </div>

          <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ color: '#94a3b8', fontSize: '14px', fontWeight: '500' }}>Total Pengeluaran</span>
              <TrendingDown color="#f87171" size={20} />
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#f87171' }}>
              Rp {totalPengeluaran.toLocaleString('id-ID')}
            </div>
          </div>

          <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ color: '#94a3b8', fontSize: '14px', fontWeight: '500' }}>Saldo Kas Bersih</span>
              <Wallet color="#38bdf8" size={20} />
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: saldoBersih >= 0 ? '#38bdf8' : '#f87171' }}>
              Rp {saldoBersih.toLocaleString('id-ID')}
            </div>
          </div>
        </div>

        {/* Form Tambah Transaksi */}
        <div style={{ background: '#1e293b', padding: '25px', borderRadius: '16px', marginBottom: '35px', border: '1px solid #334155', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #334155', paddingBottom: '12px' }}>
            <PlusCircle color="#38bdf8" size={22} />
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '600' }}>Form Pencatatan Transaksi</h3>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '40px' }}>
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
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #475569', background: '#0f172a', color: '#fff', fontSize: '14px', outline: 'none' }} 
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
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #475569', background: '#0f172a', color: '#fff', fontSize: '14px', outline: 'none' }}
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
                placeholder="Contoh: Beli Biji Kopi Robusta 1kg / Penjualan Menu Harian" 
                value={form.deskripsi} 
                onChange={handleChange} 
                required 
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #475569', background: '#0f172a', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} 
              />
              <span style={{ display: 'block', marginTop: '6px', fontSize: '12px', color: '#94a3b8' }}>
                ✨ <i>Tips: Untuk pengeluaran, kategori akan otomatis dianalisis dan diisi oleh AI Machine Learning.</i>
              </span>
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>
                <DollarSign size={15} /> Nominal (Rp)
              </label>
              <input 
                type="number" 
                name="nominal" 
                placeholder="Contoh: 150000" 
                value={form.nominal} 
                onChange={handleChange} 
                required 
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #475569', background: '#0f172a', color: '#fff', fontSize: '14px', outline: 'none' }} 
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button 
                type="submit" 
                disabled={loading} 
                style={{ width: '100%', background: 'linear-gradient(to right, #0ea5e9, #6366f1)', color: 'white', border: 'none', padding: '11px', borderRadius: '8px', fontWeight: '600', fontSize: '14px', cursor: 'pointer', transition: 'opacity 0.2s', boxShadow: '0 4px 12px rgba(14, 165, 233, 0.3)' }}
              >
                {loading ? 'Menganalisis & Menyimpan...' : 'Simpan Transaksi'}
              </button>
            </div>
          </form>
        </div>

        {/* Tabel Riwayat Transaksi */}
        <div style={{ background: '#1e293b', borderRadius: '16px', border: '1px solid #334155', overflow: 'hidden', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)' }}>
          <div style={{ padding: '20px 25px', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '600' }}>Riwayat Transaksi</h3>
            <span style={{ fontSize: '13px', background: '#334155', padding: '4px 10px', borderRadius: '20px', color: '#94a3b8' }}>
              Total: {transactions.length} transaksi
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ background: '#0f172a', color: '#94a3b8', borderBottom: '1px solid #334155' }}>
                  <th style={{ padding: '14px 20px', fontWeight: '600' }}>Tanggal</th>
                  <th style={{ padding: '14px 20px', fontWeight: '600' }}>Tipe</th>
                  <th style={{ padding: '14px 20px', fontWeight: '600' }}>Deskripsi</th>
                  <th style={{ padding: '14px 20px', fontWeight: '600' }}>Kategori (AI)</th>
                  <th style={{ padding: '14px 20px', fontWeight: '600', textAlign: 'right' }}>Nominal</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                      Belum ada riwayat data transaksi tercatat.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => (
                    <tr key={tx.id} style={{ borderBottom: '1px solid #334155', transition: 'background 0.2s' }}>
                      <td style={{ padding: '14px 20px', color: '#cbd5e1' }}>{tx.tanggal.split('T')[0]}</td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', background: tx.tipe_transaksi === 'Pemasukan' ? 'rgba(74, 222, 128, 0.15)' : 'rgba(248, 113, 113, 0.15)', color: tx.tipe_transaksi === 'Pemasukan' ? '#4ade80' : '#f87171', border: `1px solid ${tx.tipe_transaksi === 'Pemasukan' ? 'rgba(74, 222, 128, 0.3)' : 'rgba(248, 113, 113, 0.3'}` }}>
                          {tx.tipe_transaksi}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px', fontWeight: '500', color: '#f8fafc' }}>{tx.deskripsi}</td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{ background: '#334155', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', color: '#38bdf8', fontWeight: '500', border: '1px solid #475569' }}>
                          {tx.kategori}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px', textAlign: 'right', fontWeight: '700', color: tx.tipe_transaksi === 'Pemasukan' ? '#4ade80' : '#f87171' }}>
                        Rp {Number(tx.nominal).toLocaleString('id-ID')}
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