import { FileText, ArrowRight, ShieldCheck, Download, Award, Users } from "lucide-react";

export default function Home() {
  return (
    <div className="flex-grow flex flex-col items-center justify-center relative overflow-hidden py-16 px-4">
      {/* Background Decorative Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-35"></div>
      
      {/* Hero Section */}
      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-full text-xs font-semibold text-red-400">
          <Award className="h-3.5 w-3.5" /> Draf Hukum Standar Korporat Siap Pakai
        </div>
        
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
          Dokumen Legal Bisnis Premium <br />
          <span className="bg-gradient-to-r from-red-600 via-red-400 to-red-600 bg-clip-text text-transparent">
            Instan & Aman
          </span>
        </h1>
        
        <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 leading-relaxed">
          Amankan transaksi, kemitraan, dan kekayaan intelektual merek Anda dengan paket template hukum siap pakai. Diproses instan melalui integrasi pembayaran Midtrans Snap.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
          <a
            href="/legal-document"
            className="w-full sm:w-auto px-8 py-4 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-red-600/20 text-md"
          >
            Mulai Demo Unduh Dokumen <ArrowRight className="h-5 w-5" />
          </a>
          <a
            href="/dashboard"
            className="w-full sm:w-auto px-8 py-4 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 font-bold rounded-xl border border-slate-200 transition-all flex items-center justify-center gap-2 cursor-pointer text-md"
          >
            Buka Admin Dashboard <Users className="h-5 w-5 text-slate-500" />
          </a>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="relative z-10 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 pt-10 border-t border-slate-200 w-full">
        {/* Feature 1 */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col items-start gap-4">
          <div className="bg-red-500/10 p-3 rounded-lg border border-red-500/20 text-red-500">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Format Microsoft Word</h3>
            <p className="text-slate-600 text-sm mt-1.5 leading-relaxed">
              Draf file didesain dengan format DOCX yang mudah diisi, sepenuhnya dapat diedit dan disesuaikan dengan kebutuhan bisnis unik Anda.
            </p>
          </div>
        </div>

        {/* Feature 2 */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col items-start gap-4">
          <div className="bg-red-500/10 p-3 rounded-lg border border-red-500/20 text-red-500">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Keamanan Pembayaran</h3>
            <p className="text-slate-600 text-sm mt-1.5 leading-relaxed">
              Integrasi langsung menggunakan Midtrans Snap Sandbox, melayani alur leads pembeli secara aman dengan pemantauan admin.
            </p>
          </div>
        </div>

        {/* Feature 3 */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col items-start gap-4">
          <div className="bg-red-500/10 p-3 rounded-lg border border-red-500/20 text-red-500">
            <Download className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Unduh Seketika</h3>
            <p className="text-slate-600 text-sm mt-1.5 leading-relaxed">
              Tidak perlu menunggu verifikasi manual. Tepat setelah pembayaran selesai, status ter-update dan dokumen siap diunduh.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
