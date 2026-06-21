'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Search, 
  Calendar, 
  RefreshCw, 
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Smartphone,
  Check,
  Building,
  Loader2,
  Download
} from 'lucide-react';

interface Transaction {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  whatsapp: string;
  brandName: string;
  totalPrice: number;
  status: 'Leads' | 'Client';
}

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [search, setSearch] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Sesi Admin Auth
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);
  const [loginUsername, setLoginUsername] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [loginLoading, setLoginLoading] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string>('');

  // Fetch transactions from API
  const fetchTransactions = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const response = await fetch('/api/transactions');
      if (!response.ok) {
        if (response.status === 401) {
          setIsAuthenticated(false);
          return;
        }
        throw new Error('Gagal mengambil data dari server.');
      }
      
      const data = await response.json();
      setTransactions(data.transactions || []);
      setFilteredTransactions(data.transactions || []);
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi kesalahan saat sinkronisasi data.');
    } finally {
      setLoading(false);
    }
  };

  // Cek Status Autentikasi
  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/admin/check-auth');
      const data = await response.json();
      if (data.authenticated) {
        setIsAuthenticated(true);
        await fetchTransactions(false);
      } else {
        setIsAuthenticated(false);
      }
    } catch (err) {
      setIsAuthenticated(false);
    } finally {
      setCheckingAuth(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Form Submit Login Admin
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!loginUsername.trim() || !loginPassword.trim()) {
      setLoginError('Username dan password wajib diisi.');
      return;
    }
    setLoginLoading(true);
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginUsername, password: loginPassword }),
      });
      const data = await response.json();
      if (response.ok) {
        setIsAuthenticated(true);
        setLoginUsername('');
        setLoginPassword('');
        await fetchTransactions(true);
      } else {
        setLoginError(data.error || 'Username atau password salah.');
      }
    } catch (err) {
      setLoginError('Koneksi gagal. Periksa koneksi internet Anda.');
    } finally {
      setLoginLoading(false);
    }
  };

  // Logout Admin
  const handleLogout = async () => {
    try {
      const response = await fetch('/api/admin/logout', { method: 'POST' });
      if (response.ok) {
        setIsAuthenticated(false);
        setTransactions([]);
        setFilteredTransactions([]);
      }
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Filter and Search logic
  useEffect(() => {
    let result = [...transactions];
    
    if (search.trim()) {
      const query = search.toLowerCase();
      result = result.filter(tx => 
        tx.name.toLowerCase().includes(query) ||
        tx.email.toLowerCase().includes(query) ||
        tx.brandName.toLowerCase().includes(query) ||
        tx.id.toLowerCase().includes(query) ||
        tx.whatsapp.includes(query)
      );
    }

    if (filterStatus !== 'all') {
      result = result.filter(tx => tx.status === filterStatus);
    }

    setFilteredTransactions(result);
  }, [search, filterStatus, transactions]);

  // Simulate Payment Success via webhook
  const simulatePaymentSuccess = async (trxId: string) => {
    setUpdatingId(trxId);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const response = await fetch('/api/payment-success', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId: trxId, status: 'Client' }),
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Gagal memproses status transaksi.');
      
      setSuccessMessage(`Berhasil menyimulasikan pembayaran untuk transaksi ${trxId}!`);
      
      // Auto dismiss success toast after 3s
      setTimeout(() => setSuccessMessage(''), 4000);
      
      // Refresh database records
      await fetchTransactions(false);
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi kegagalan webhook.');
    } finally {
      setUpdatingId(null);
    }
  };

  // Helper date formatting
  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Metrics
  const totalLeads = transactions.filter(tx => tx.status === 'Leads').length;
  const totalClients = transactions.filter(tx => tx.status === 'Client').length;
  const totalRevenue = transactions
    .filter(tx => tx.status === 'Client')
    .reduce((sum, tx) => sum + (tx.totalPrice || 0), 0);
  const conversionRate = transactions.length > 0 
    ? ((totalClients / transactions.length) * 100).toFixed(1) 
    : '0';

  if (checkingAuth) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center py-32 text-slate-500 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-red-500" />
        <p className="text-sm font-semibold">Memverifikasi sesi admin...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-md w-full mx-auto px-4 py-16 flex-grow flex flex-col justify-center">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-50/50 to-red-100/5 px-6 py-6 border-b border-slate-200 text-center">
            <div className="bg-red-600 text-white p-2.5 rounded-xl inline-block mb-3 shadow-md shadow-red-600/10">
              <Users className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900">Login Admin</h2>
            <p className="text-xs text-slate-500 mt-1">Akses khusus pengelola smartlegal.id</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLoginSubmit} className="p-6 space-y-4">
            {loginError && (
              <div className="bg-rose-50 border border-rose-200 p-3 rounded-lg text-xs text-rose-800 flex gap-2 items-center">
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Username
              </label>
              <input
                type="text"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                placeholder="Masukkan username"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Password
              </label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-2.5 bg-red-600 hover:bg-red-700 active:scale-95 disabled:bg-red-800 text-white font-bold rounded-lg text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-red-600/10"
            >
              {loginLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Memverifikasi...
                </>
              ) : (
                'Masuk Dashboard'
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8 flex-grow space-y-8">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Dashboard Transaksi Admin
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Pantau arus data leads pelanggan dan status pembayaran lisensi dokumen hukum Anda.
          </p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => fetchTransactions(true)}
            disabled={loading}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 active:scale-95 text-xs text-slate-700 font-bold rounded-lg border border-slate-200 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Sinkronkan Data
          </button>
          
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-50 hover:bg-red-100 active:scale-95 text-xs text-red-650 font-bold rounded-lg border border-red-200 flex items-center gap-2 transition-all cursor-pointer"
          >
            Keluar (Logout)
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Leads */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider block">Total Leads</span>
            <span className="text-2xl font-extrabold text-slate-900 mt-1 block">{totalLeads}</span>
            <span className="text-[10px] text-red-500 mt-1 block">Menunggu Pembayaran</span>
          </div>
          <div className="bg-red-500/10 p-3 rounded-lg border border-red-500/20 text-red-500">
            <Users className="h-6 w-6" />
          </div>
        </div>

        {/* Card 2: Clients */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider block">Total Client</span>
            <span className="text-2xl font-extrabold text-emerald-600 mt-1 block">{totalClients}</span>
            <span className="text-[10px] text-emerald-600 mt-1 block">Pembayaran Terverifikasi</span>
          </div>
          <div className="bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20 text-emerald-600">
            <CheckCircle className="h-6 w-6" />
          </div>
        </div>

        {/* Card 3: Conversion */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider block">Conversion Rate</span>
            <span className="text-2xl font-extrabold text-sky-600 mt-1 block">{conversionRate}%</span>
            <span className="text-[10px] text-sky-600 mt-1 block">Leads menjadi Client</span>
          </div>
          <div className="bg-sky-500/10 p-3 rounded-lg border border-sky-500/20 text-sky-600">
            <TrendingUp className="h-6 w-6" />
          </div>
        </div>

        {/* Card 4: Revenue */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider block">Omset Penjualan</span>
            <span className="text-2xl font-extrabold text-red-600 mt-1 block">
              Rp {totalRevenue.toLocaleString('id-ID')}
            </span>
            <span className="text-[10px] text-red-500/80 mt-1 block">Total Pendapatan Bersih</span>
          </div>
          <div className="bg-red-500/10 p-3 rounded-lg border border-red-500/20 text-red-400">
            <DollarSign className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Alert Notifications */}
      {errorMessage && (
        <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl flex gap-3 text-sm text-rose-800">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
          <p>{errorMessage}</p>
        </div>
      )}

      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex gap-3 text-sm text-emerald-800">
          <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
          <p>{successMessage}</p>
        </div>
      )}

      {/* Table Container Card */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-md">
        
        {/* Filter Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50">
          {/* Search bar */}
          <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama, email, brand, ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-red-500 transition-all"
            />
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2 w-full md:w-auto justify-end">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:border-red-500 cursor-pointer"
            >
              <option value="all">Semua Status</option>
              <option value="Leads">Leads (Belum Bayar)</option>
              <option value="Client">Client (Lunas)</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-red-500" />
              <p className="text-sm font-semibold">Memuat transaksi...</p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-20 text-slate-500 text-sm">
              <AlertCircle className="h-8 w-8 text-slate-600 mx-auto mb-2" />
              Tidak ada riwayat transaksi yang cocok dengan filter.
            </div>
          ) : (
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-5 py-4">ID Transaksi</th>
                  <th className="px-5 py-4">Tanggal Pemesanan</th>
                  <th className="px-5 py-4">Nama Leads</th>
                  <th className="px-5 py-4">Kontak Pelanggan</th>
                  <th className="px-5 py-4">Nama Usaha / Merek</th>
                  <th className="px-5 py-4 text-right">Tagihan</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-center">Aksi / Simulasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60 bg-white text-slate-700">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/60 transition-all">
                    
                    {/* ID */}
                    <td className="px-5 py-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {tx.id}
                    </td>
                    
                    {/* Created Date */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        {formatDate(tx.createdAt)}
                      </div>
                    </td>
                    
                    {/* Name */}
                    <td className="px-5 py-4 font-semibold text-slate-900 whitespace-nowrap">
                      {tx.name}
                    </td>
                    
                    {/* Contact details */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="space-y-0.5">
                        <span className="block text-slate-800">{tx.email}</span>
                        <span className="block text-slate-500 font-mono text-[10px] flex items-center gap-1">
                          <Smartphone className="h-3 w-3 text-slate-400" /> {tx.whatsapp}
                        </span>
                      </div>
                    </td>
                    
                    {/* Brand Name */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-medium text-slate-800">
                        <Building className="h-3.5 w-3.5 text-red-500/60" />
                        {tx.brandName}
                      </div>
                    </td>
                    
                    {/* Total Price */}
                    <td className="px-5 py-4 text-right whitespace-nowrap font-bold text-slate-900 font-mono">
                      Rp {tx.totalPrice.toLocaleString('id-ID')}
                    </td>
                    
                    {/* Status Badge */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2.5 py-1 text-[10px] font-bold uppercase rounded border ${
                        tx.status === 'Client'
                          ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/30'
                          : 'bg-red-950/40 text-red-500 border-red-800/30'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                    
                    {/* Simulation trigger / Webhook mock action */}
                    <td className="px-5 py-4 whitespace-nowrap text-center">
                      {tx.status === 'Leads' ? (
                        <button
                          type="button"
                          onClick={() => simulatePaymentSuccess(tx.id)}
                          disabled={updatingId === tx.id}
                          className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-700 active:scale-95 text-[10px] text-slate-950 font-bold rounded-lg transition-all flex items-center gap-1 mx-auto cursor-pointer shadow-md shadow-emerald-500/10"
                        >
                          {updatingId === tx.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Check className="h-3 w-3" />
                          )}
                          Simulasikan Lunas
                        </button>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-[10px] text-slate-500 font-semibold italic flex items-center gap-1">
                            <CheckCircle className="h-3 w-3 text-emerald-500" /> Selesai
                          </span>
                          <a
                            href={`/api/download/${tx.id}`}
                            className="px-2.5 py-1 bg-red-600 hover:bg-red-700 active:scale-95 text-[10px] text-white font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer shadow-md shadow-red-600/10"
                          >
                            <Download className="h-3 w-3" /> Unduh ZIP
                          </a>
                        </div>
                      )}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer of Table */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 text-right text-[10px] text-slate-500">
          Menampilkan {filteredTransactions.length} dari total {transactions.length} record transaksi terdaftar.
        </div>

      </div>
    </div>
  );
}
