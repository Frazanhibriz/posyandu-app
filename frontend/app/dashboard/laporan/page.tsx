"use client";

import { useState, useEffect } from "react";
import { 
  ChevronDown, 
  Users, 
  Calendar, 
  TrendingUp, 
  Download, 
  Lightbulb 
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Card from "@/components/ui/Card";
import { getBalitaList, getAbsensiList } from "@/lib/api";
import { Balita, Absensi } from "@/types";
import { useToast } from "@/components/ui/Toast";

export default function LaporanPage() {
  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2015 + 1 }, (_, i) => (currentYear - i).toString());

  const [selectedMonth, setSelectedMonth] = useState(months[new Date().getMonth()]);
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const [balitaList, setBalitaList] = useState<Balita[]>([]);
  const [absenList, setAbsenList] = useState<Absensi[]>([]);
  const { warning } = useToast();

  useEffect(() => {
    getBalitaList().then(setBalitaList).catch(console.error);
  }, []);

  useEffect(() => {
    const bulanIndex = months.indexOf(selectedMonth) + 1;
    getAbsensiList(bulanIndex, parseInt(selectedYear)).then(setAbsenList).catch(console.error);
  }, [selectedMonth, selectedYear]);

  // Determine statistics based on period selection
  const isMockupPeriod = false; // Disable mockup data for real backend integration

  const totalBalita = balitaList.length;
  const hadir = absenList.filter(a => a.isHadir).length;
  const belumHadir = balitaList.length - hadir;

  // Percentage attendance calculation
  const percentage = isMockupPeriod 
    ? 87.5 
    : (hadir + belumHadir > 0 ? parseFloat(((hadir / (hadir + belumHadir)) * 100).toFixed(1)) : 0);

  const handleExportCSV = () => {
    // Indonesian language headers and formatted data
    const headers = [
      "ID", 
      "Nama Balita", 
      "Umur", 
      "Jenis Kelamin", 
      "Nama Ibu", 
      "Alamat", 
      "Status Pengukuran", 
      "Status Kehadiran"
    ];
    
    // Use the actual list
    const dataToExport = balitaList;

    if (dataToExport.length === 0) {
      warning("Tidak ada data balita untuk diunduh pada periode ini.");
      return;
    }

    const bulanIndex = months.indexOf(selectedMonth) + 1;
    const rows = dataToExport.map(b => {
      const isMeasured = b.pengukuran?.some(p => p.bulan === bulanIndex && p.tahun.toString() === selectedYear);
      const isHadir = absenList.find(a => a.balitaId === b.id)?.isHadir;

      return [
        b.id,
        b.nama,
        "", // Umur removed or you could calculate it from tglLahir
        b.jenisKelamin === "PEREMPUAN" ? "Perempuan" : "Laki-laki",
        b.namaWali,
        `${b.alamat} RT ${b.rt}/RW ${b.rw}`,
        isMeasured ? "Sudah diukur" : "Belum diukur",
        isHadir ? "Hadir" : "Belum Hadir"
      ];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Laporan_Posyandu_${selectedMonth}_${selectedYear}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-black font-sans pb-10">
      <Navbar title="Laporan" />
      
      <main className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6 mt-2">
        
        {/* Responsive Grid Wrapper */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Left Column: Periode, Cetak Laporan, Tips */}
          <div className="space-y-6">
            {/* Periode Laporan */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-gray-800 ml-1">Periode Laporan</h4>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Bulan Selector */}
                <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex flex-col justify-between relative focus-within:ring-2 focus-within:ring-teal-100 transition-all">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Bulan</span>
                  <div className="relative flex items-center">
                    <select 
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="w-full bg-transparent appearance-none text-sm font-bold text-gray-800 focus:outline-none pr-8 cursor-pointer"
                    >
                      {months.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="absolute right-0 text-gray-500 pointer-events-none" />
                  </div>
                </div>

                {/* Tahun Selector */}
                <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex flex-col justify-between relative focus-within:ring-2 focus-within:ring-teal-100 transition-all">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Tahun</span>
                  <div className="relative flex items-center">
                    <select 
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                      className="w-full bg-transparent appearance-none text-sm font-bold text-gray-800 focus:outline-none pr-8 cursor-pointer"
                    >
                      {years.map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="absolute right-0 text-gray-500 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Cetak Laporan */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-gray-800 ml-1">Cetak Laporan</h4>
              <Card className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl flex flex-col items-center justify-center">
                <button 
                  onClick={handleExportCSV}
                  className="w-full flex items-center justify-between border border-gray-200 hover:border-teal-500 hover:bg-teal-50/10 p-4 rounded-xl transition-all duration-300 group cursor-pointer active:scale-[0.99]"
                >
                  <span className="text-sm font-bold text-gray-800 group-hover:text-teal-900 transition-colors">
                    Laporan Sasaran Bayi-Balita
                  </span>
                  <Download size={20} className="text-gray-600 group-hover:text-teal-600 group-hover:translate-y-0.5 transition-all" />
                </button>
                <span className="text-[10px] text-gray-400 font-semibold mt-4">
                  Laporan akan diunduh dalam format CSV
                </span>
              </Card>
            </div>

            {/* Tips Section */}
            <div className="bg-[#eff6ff] border border-blue-100 rounded-2xl p-4 sm:p-5 flex items-start gap-4 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-white text-amber-500 flex items-center justify-center shrink-0 shadow-sm">
                <Lightbulb size={22} className="fill-amber-400 stroke-amber-500" />
              </div>
              <div>
                <p className="text-xs text-blue-900 font-medium leading-relaxed">
                  <strong className="font-bold text-blue-950">Tips:</strong> Ekspor laporan secara berkala untuk dokumentasi posyandu dan pelaporan ke puskesmas
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Ringkasan & Tingkat Kehadiran */}
          <div className="lg:col-span-2 space-y-6">
            {/* Ringkasan */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-gray-800 ml-1">
                Ringkasan {months.find(m => m === selectedMonth)} {selectedYear}
              </h4>

              <div className="grid grid-cols-2 gap-4">
                {/* Total Balita Card */}
                <Card className="flex flex-col items-center justify-center p-6 bg-[#f3f7ff] border border-blue-50 text-center rounded-2xl hover:scale-[1.02] transition-transform duration-300 bg-white">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-500 shadow-sm mb-3">
                    <Users size={22} strokeWidth={2.5} />
                  </div>
                  <span className="text-3xl font-black text-gray-900 leading-none">{totalBalita}</span>
                  <span className="text-[11px] font-semibold text-gray-500 mt-2">Total balita</span>
                </Card>

                {/* Hadir Card */}
                <Card className="flex flex-col items-center justify-center p-6 bg-[#f0fbf7] border border-emerald-50 text-center rounded-2xl hover:scale-[1.02] transition-transform duration-300 bg-white">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#10b981] shadow-sm mb-3">
                    <Calendar size={22} strokeWidth={2.5} />
                  </div>
                  <span className="text-3xl font-black text-gray-900 leading-none">{hadir}</span>
                  <span className="text-[11px] font-semibold text-gray-500 mt-2">Hadir</span>
                </Card>

                {/* Belum Hadir Card */}
                <Card className="col-span-2 flex flex-col items-center justify-center p-6 bg-[#fffbeb] border border-amber-50 text-center rounded-2xl hover:scale-[1.01] transition-transform duration-300 bg-white">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-amber-500 shadow-sm mb-3">
                    <TrendingUp size={22} strokeWidth={2.5} />
                  </div>
                  <span className="text-3xl font-black text-gray-900 leading-none">{belumHadir}</span>
                  <span className="text-[11px] font-semibold text-gray-500 mt-2">Belum Hadir</span>
                </Card>
              </div>
            </div>

            {/* Tingkat Kehadiran */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-gray-800 ml-1">Tingkat Kehadiran</h4>
              
              <Card className="p-5 bg-white border border-gray-100 shadow-sm rounded-2xl">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold text-gray-700">Kehadiran</span>
                  <span className="text-sm font-black text-gray-900">{percentage}%</span>
                </div>
                
                {/* Custom animated progress bar */}
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#0d9488] rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </Card>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
