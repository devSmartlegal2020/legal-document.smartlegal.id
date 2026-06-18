'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  CheckCircle, 
  ArrowRight, 
  ShieldCheck, 
  Download, 
  Mail, 
  Phone, 
  Briefcase, 
  User, 
  CreditCard,
  AlertCircle,
  Loader2
} from 'lucide-react';

// Declaring snap types locally
declare global {
  interface Window {
    snap: any;
  }
}

interface LeadForm {
  name: string;
  email: string;
  whatsapp: string;
  brandName: string;
}

interface TransactionData {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  brandName: string;
  totalPrice: number;
  status: string;
}

export default function LegalDocumentPage() {
  const [form, setForm] = useState<LeadForm>({
    name: '',
    email: '',
    whatsapp: '',
    brandName: '',
  });
  
  const [errors, setErrors] = useState<Partial<LeadForm>>({});
  const [step, setStep] = useState<'form' | 'summary' | 'success'>('form');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  // Transaction context
  const [snapToken, setSnapToken] = useState<string>('');
  const [transaction, setTransaction] = useState<TransactionData | null>(null);
  
  // Simulated Payment Modal visibility (when window.snap is missing or blocked)
  const [showSimulatedPayment, setShowSimulatedPayment] = useState<boolean>(false);

  // Template list that user gets
  const documentTemplates = [
    { name: '(1) smartlegal - PERJANJIAN PEMEGANG SAHAM - 2024', size: '801 KB', format: 'RTF' },
    { name: '(2) smartlegal - PERJANJIAN PENUNJUKAN DIREKTUR - 2024', size: '698 KB', format: 'RTF' },
    { name: '(3) smartlegal - BUKU DAFTAR PEMEGANG SAHAM - 2024', size: '476 KB', format: 'RTF' },
    { name: '(4) smartlegal - SERTIFIKAT SAHAM - 2024', size: '446 KB', format: 'RTF' },
    { name: '(5) smartlegal - PERJANJIAN PENGELOLAAN INVESTASI - 2024', size: '612 KB', format: 'RTF' },
    { name: '(6) smartlegal - PERJANJIAN PENGAKUAN UTANG - 2024', size: '559 KB', format: 'RTF' },
    { name: '(7) smartlegal_PERJANJIAN_KERAHASIAAN_&_LARANGAN_BERKOMPETISI_2024', size: '563 KB', format: 'RTF' },
    { name: '(8) smartlegal - PKWT (KONTRAK KERJA) - 2024', size: '592 KB', format: 'RTF' },
    { name: '(9) smartlegal - PKWTT (PERJANJIAN KARYAWAN TETAP) - 2024', size: '574 KB', format: 'RTF' },
    { name: '(10) smartlegal - SURAT PENGANGKATAN KARYAWAN TETAP - 2024', size: '421 KB', format: 'RTF' },
    { name: '(11) smartlegal - SURAT PENGANGKATAN KARYAWAN TETAP - 2024', size: '422 KB', format: 'RTF' },
    { name: '(12) smartlegal - SURAT PERINGATAN KERJA - 2024', size: '408 KB', format: 'RTF' },
    { name: '(13) smartlegal - PERJANJIAN SEWA RUKO - 2024', size: '529 KB', format: 'RTF' },
    { name: '(14) smartlegal - PERJANJIAN KEMITRAAN USAHA-BISNIS - 2024', size: '693 KB', format: 'RTF' },
    { name: '(15) smartlegal_PERJANJIAN_RENOV_RUMAH_atau_BANGUN_RUMAH_2024', size: '867 KB', format: 'RTF' },
    { name: '(16) smartlegal - PERJANJIAN JASA LOGO & WEBSITE - 2024', size: '627 KB', format: 'RTF' },
    { name: '(17) smartlegal - PERJANJIAN PEMBEBASAN LAHAN - 2024', size: '703 KB', format: 'RTF' },
    { name: '(18) smartlegal - PERJANJIAN PENUNJUKAN AGEN - 2024', size: '672 KB', format: 'RTF' },
  ];

  // Validation
  const validateForm = () => {
    const newErrors: Partial<LeadForm> = {};
    if (!form.name.trim()) newErrors.name = 'Nama lengkap wajib diisi.';
    if (!form.email.trim()) {
      newErrors.email = 'Alamat email wajib diisi.';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = 'Format email tidak valid.';
    }
    if (!form.whatsapp.trim()) {
      newErrors.whatsapp = 'No. WhatsApp wajib diisi.';
    } else if (!/^\d+$/.test(form.whatsapp)) {
      newErrors.whatsapp = 'No. WhatsApp harus berupa angka saja.';
    } else if (form.whatsapp.length < 9) {
      newErrors.whatsapp = 'No. WhatsApp minimal 9 digit.';
    }
    if (!form.brandName.trim()) newErrors.brandName = 'Nama Merek/Usaha wajib diisi.';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'whatsapp') {
      const numericValue = value.replace(/\D/g, ''); // Hapus semua karakter non-angka
      setForm(prev => ({ ...prev, [name]: numericValue }));
      if (errors.whatsapp) {
        setErrors(prev => ({ ...prev, whatsapp: '' }));
      }
      return;
    }
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof LeadForm]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setStep('summary');
    }
  };

  // Trigger Checkout -> Get Token
  const handleInitiateCheckout = async () => {
    setLoading(true);
    setErrorMessage('');
    
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Gagal memulai proses checkout.');
      }
      
      setSnapToken(data.token);
      setTransaction(data.transaction);
      
      // Check if Midtrans Snap is loaded
      if (window.snap && typeof window.snap.pay === 'function') {
        window.snap.pay(data.token, {
          onSuccess: async function (result: any) {
            console.log('Payment success:', result);
            await handlePaymentSuccess(data.transaction.id);
          },
          onPending: function (result: any) {
            console.log('Payment pending:', result);
            alert('Pembayaran Anda sedang diproses. Silakan selesaikan pembayaran.');
          },
          onError: function (result: any) {
            console.error('Payment error:', result);
            setErrorMessage('Pembayaran gagal dilakukan. Silakan coba kembali.');
          },
          onClose: function () {
            console.log('Payment popup closed');
          }
        });
      } else {
        // Fallback to Simulated Payment Modal if Midtrans Script not ready
        console.warn('Midtrans Snap SDK not loaded. Activating fallback simulator.');
        setShowSimulatedPayment(true);
      }
    } catch (error: any) {
      setErrorMessage(error.message || 'Terjadi kesalahan sistem.');
    } finally {
      setLoading(false);
    }
  };

  // Send request to payment success API to complete payment
  const handlePaymentSuccess = async (trxId: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/payment-success', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId: trxId, status: 'Client' }),
      });
      
      if (response.ok) {
        setStep('success');
        if (transaction) {
          setTransaction({ ...transaction, status: 'Client' });
        }
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Gagal memperbarui status transaksi.');
      }
    } catch (error: any) {
      setErrorMessage(`Pembayaran sukses, namun gagal sinkronisasi database: ${error.message}`);
      // Fallback transition so user gets documents anyway
      setStep('success');
    } finally {
      setLoading(false);
      setShowSimulatedPayment(false);
    }
  };

  const handleSimulateFail = () => {
    setErrorMessage('Simulasi Pembayaran: Transaksi dibatalkan atau pembayaran gagal.');
    setShowSimulatedPayment(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8 flex-grow flex flex-col justify-center">
      {/* Progress Steps Indicator */}
      <div className="flex items-center justify-center space-x-4 mb-10">
        <div className="flex items-center">
          <span className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${
            step === 'form' ? 'bg-red-600 text-white ring-4 ring-red-600/20' : 'bg-red-50 text-red-600 font-bold'
          }`}>1</span>
          <span className={`ml-2 text-sm font-semibold ${step === 'form' ? 'text-slate-900 font-bold' : 'text-slate-500'}`}>Data Leads</span>
        </div>
        <div className="h-0.5 w-12 bg-slate-200"></div>
        <div className="flex items-center">
          <span className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${
            step === 'summary' ? 'bg-red-600 text-white ring-4 ring-red-600/20' : (step === 'success' ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-400')
          }`}>2</span>
          <span className={`ml-2 text-sm font-semibold ${step === 'summary' ? 'text-slate-900 font-bold' : 'text-slate-500'}`}>Ringkasan</span>
        </div>
        <div className="h-0.5 w-12 bg-slate-200"></div>
        <div className="flex items-center">
          <span className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${
            step === 'success' ? 'bg-emerald-600 text-white ring-4 ring-emerald-600/20' : 'bg-slate-100 text-slate-400'
          }`}>3</span>
          <span className={`ml-2 text-sm font-semibold ${step === 'success' ? 'text-slate-900 font-bold' : 'text-slate-500'}`}>Selesai</span>
        </div>
      </div>

      {/* Main Container Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
        
        {/* Header Section */}
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-8 border-b border-slate-200 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] opacity-10"></div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {step === 'success' ? 'Pembayaran Berhasil!' : 'Paket Dokumen Legal Bisnis (Starter)'}
          </h1>
          <p className="mt-2 text-sm text-slate-600 max-w-xl mx-auto">
            {step === 'success' 
              ? 'Terima kasih atas pembelian Anda. Silakan unduh file dokumen legal Anda di bawah.'
              : 'Dapatkan 4 draf hukum krusial berstandar korporat untuk melindungi usaha Anda.'}
          </p>
        </div>

        {/* STEP 1: FORM DATA LEADS */}
        {step === 'form' && (
          <form onSubmit={handleFormSubmit} className="p-6 sm:p-8 space-y-6">
            <h2 className="text-lg font-semibold text-red-600 flex items-center gap-2">
              <User className="h-5 w-5 text-red-500" /> Informasi Pemilik & Merek
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Nama Lengkap */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleInputChange}
                    placeholder="Budi Santoso"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-55 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all text-sm"
                  />
                </div>
                {errors.name && <p className="mt-1 text-xs text-rose-500 flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" /> {errors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Alamat Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleInputChange}
                    placeholder="budi@merekmu.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all text-sm"
                  />
                </div>
                {errors.email && <p className="mt-1 text-xs text-rose-500 flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" /> {errors.email}</p>}
              </div>

              {/* No WhatsApp */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  No. WhatsApp
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                  <input
                    type="tel"
                    name="whatsapp"
                    value={form.whatsapp}
                    onChange={handleInputChange}
                    placeholder="08123456789"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all text-sm"
                  />
                </div>
                {errors.whatsapp && <p className="mt-1 text-xs text-rose-500 flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" /> {errors.whatsapp}</p>}
              </div>

              {/* Nama Merek */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Nama Merek / Nama Usaha
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    name="brandName"
                    value={form.brandName}
                    onChange={handleInputChange}
                    placeholder="Kopi Merekmu"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all text-sm"
                  />
                </div>
                {errors.brandName && <p className="mt-1 text-xs text-rose-500 flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" /> {errors.brandName}</p>}
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-red-600/10 hover:shadow-red-600/20"
              >
                Lanjutkan Ke Ringkasan <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: SUMMARY & PRICING */}
        {step === 'summary' && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Left Column: Lead Review */}
              <div className="space-y-4">
                <h3 className="text-md font-semibold text-slate-700">Verifikasi Detail Leads</h3>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 text-sm text-slate-600">
                  <div>
                    <span className="text-slate-500 text-xs block uppercase">Nama Pemesan</span>
                    <span className="font-semibold text-slate-900">{form.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-xs block uppercase">Email & WhatsApp</span>
                    <span className="font-semibold text-slate-900">{form.email} • {form.whatsapp}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-xs block uppercase">Nama Merek/Usaha</span>
                    <span className="font-semibold text-slate-900">{form.brandName}</span>
                  </div>
                </div>

                <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex gap-3">
                  <ShieldCheck className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-700 leading-relaxed">
                    Lisensi draf perjanjian bersifat siap pakai untuk merek <strong>{form.brandName}</strong>. Setiap template dilengkapi instruksi pengisian yang mudah dipahami.
                  </p>
                </div>
              </div>

              {/* Right Column: Templates & Price */}
              <div className="space-y-4">
                <h3 className="text-md font-semibold text-slate-700">Dokumen Yang Didapatkan</h3>
                <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1.5 custom-scrollbar">
                  {documentTemplates.map((tmpl, idx) => (
                    <div key={idx} className="flex items-center bg-slate-50 border border-slate-200 hover:border-red-200 hover:bg-slate-100 transition-all rounded-lg px-3.5 py-2.5 text-xs text-slate-600 cursor-help group" title={tmpl.name}>
                      <div className="flex items-center gap-2 text-slate-800 font-medium truncate w-full">
                        <FileText className="h-4 w-4 text-red-500 shrink-0 group-hover:scale-110 transition-transform" />
                        <span className="truncate">{tmpl.name}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price Tag */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mt-6">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-slate-500 text-sm">Harga Spesial Bundle</span>
                    <span className="text-slate-400 line-through text-xs">Rp 399.000</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-slate-200 pt-3">
                    <span className="text-slate-800 font-bold text-sm">Total Pembayaran</span>
                    <span className="text-red-600 font-extrabold text-xl">Rp 99.000</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl flex gap-3 text-sm text-rose-800">
                <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                <p>{errorMessage}</p>
              </div>
            )}

            {/* Actions */}
            <div className="pt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
              <button
                type="button"
                onClick={() => setStep('form')}
                className="w-full sm:w-auto px-5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-semibold rounded-lg transition-all cursor-pointer text-center"
              >
                Kembali & Ubah Form
              </button>
              
              <button
                type="button"
                onClick={handleInitiateCheckout}
                disabled={loading}
                className="w-full sm:w-auto px-8 py-3.5 bg-red-600 hover:bg-red-700 disabled:bg-red-800 active:scale-95 text-white font-bold rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-red-600/20"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" /> Memproses Transaksi...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-5 w-5" /> Beli Template (Bayar Sekarang)
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: SUCCESS STATE */}
        {step === 'success' && (
          <div className="p-6 sm:p-8 space-y-8">
            
            {/* Header Success info */}
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="h-16 w-16 bg-emerald-100 border border-emerald-200 rounded-full flex items-center justify-center text-emerald-600">
                <CheckCircle className="h-10 w-10" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Pembayaran Sukses Diverifikasi</h2>
              <p className="text-sm text-slate-600 max-w-md">
                Selamat! Transaksi <strong className="text-slate-800">{transaction?.id}</strong> telah diverifikasi. Silakan unduh dokumen Anda langsung di bawah.
              </p>
            </div>

            {/* Document Download Center */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-slate-250">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Daftar Link Unduh Dokumen</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Semua template di bawah telah dibundel ke dalam file ZIP.</p>
                </div>
                <a
                  href={`/api/download/${transaction?.id}`}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 active:scale-95 text-xs text-white font-bold rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-red-600/10 self-stretch sm:self-auto text-center"
                >
                  <Download className="h-3.5 w-3.5" /> Unduh Bundle ZIP
                </a>
              </div>
              
              <div className="divide-y divide-slate-200 max-h-[360px] overflow-y-auto pr-1.5 custom-scrollbar">
                {documentTemplates.map((tmpl, idx) => (
                  <div key={idx} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0 gap-4 hover:bg-slate-100/50 transition-colors px-2 rounded-lg" title={tmpl.name}>
                    <div className="flex items-center gap-3 truncate min-w-0 cursor-help">
                      <div className="bg-red-50/50 p-2 rounded border border-slate-200 shrink-0">
                        <FileText className="h-5 w-5 text-red-500" />
                      </div>
                      <div className="truncate min-w-0">
                        <span className="font-semibold text-slate-800 text-sm block truncate">{tmpl.name}</span>
                        <span className="text-[11px] text-slate-500 font-mono block">{tmpl.size}</span>
                      </div>
                    </div>
                    
                    <a
                      href={`/api/download/${transaction?.id}`}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 active:scale-95 text-xs text-slate-850 font-bold rounded-lg border border-slate-200 flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                    >
                      <Download className="h-3.5 w-3.5 text-red-500" /> Unduh ZIP
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Leads Recap / Invoice Info */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 space-y-2">
              <h4 className="font-semibold text-slate-700">Rincian Pembelian:</h4>
              <div className="grid grid-cols-2 gap-y-1 gap-x-4">
                <div>ID Transaksi: <strong className="text-slate-900">{transaction?.id}</strong></div>
                <div>Nama Pembeli: <span className="text-slate-900">{transaction?.name}</span></div>
                <div>Email: <span className="text-slate-900">{transaction?.email}</span></div>
                <div>Brand Terdaftar: <span className="text-slate-900">{transaction?.brandName}</span></div>
                <div>Status Transaksi: <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 border border-emerald-200 rounded font-bold uppercase text-[9px]">Client</span></div>
                <div>Harga Bundle: <span className="text-slate-900">Rp 99.000</span></div>
              </div>
            </div>

            {/* Back Button */}
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => {
                  setForm({ name: '', email: '', whatsapp: '', brandName: '' });
                  setStep('form');
                  setTransaction(null);
                  setSnapToken('');
                }}
                className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold rounded-lg border border-slate-700 transition-all cursor-pointer"
              >
                Beli Template Baru
              </button>
            </div>
          </div>
        )}

      </div>

      {/* FALLBACK SIMULATOR MODAL (For Sandbox Mock Checkout without client key) */}
      {showSimulatedPayment && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-red-500/10 to-red-600/5 px-6 py-5 border-b border-slate-200 flex items-center gap-3">
              <div className="bg-red-600 text-white p-2 rounded-lg">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-md">Midtrans Snap Simulator</h3>
                <p className="text-xs text-red-600/60">Simulasi Gerbang Pembayaran Sandbox</p>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <div className="text-sm text-slate-600 space-y-2">
                <p>Aplikasi ini mendeteksi tidak adanya integrasi client-key aktif di browser atau script diblokir. Silakan pilih status simulasi pembayaran:</p>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1 font-mono text-xs text-slate-700">
                  <div>ID Transaksi: <span className="text-red-600">{transaction?.id}</span></div>
                  <div>Produk: <span className="text-slate-950">Bundle Template Legal</span></div>
                  <div>Tagihan: <span className="text-slate-950">Rp 99.000</span></div>
                </div>
              </div>

              {errorMessage && (
                <div className="bg-rose-50 border border-rose-200 p-3 rounded-lg text-xs text-rose-800">
                  {errorMessage}
                </div>
              )}

              {/* Simulation Options */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => transaction && handlePaymentSuccess(transaction.id)}
                  disabled={loading}
                  className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-slate-950 font-bold rounded-lg text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                  Bayar Sukses (Simulasi Pembayaran)
                </button>
                
                <button
                  type="button"
                  onClick={handleSimulateFail}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-semibold rounded-lg text-sm border border-slate-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  Batalkan Pembayaran / Gagal
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 text-center text-[10px] text-slate-500">
              Menghubungi endpoint lokal <code>/api/payment-success</code> untuk sinkronisasi state.
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
