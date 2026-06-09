"use client";

import { useState, useRef, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Card from "@/components/ui/Card";
import { 
  CalendarDays, 
  Search, 
  Plus, 
  PencilLine, 
  PackageCheck, 
  Baby
} from "lucide-react";
import { useRouter } from "next/navigation";
import { getBalitaList, getDashboardStats } from "@/lib/api";
import { Balita, BerandaStats } from "@/types";

export default function DashboardPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [balitaList, setBalitaList] = useState<Balita[]>([]);
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);

  const [stats, setStats] = useState<BerandaStats | null>(null);

  useEffect(() => {
    getBalitaList().then(setBalitaList).catch(console.error);
    getDashboardStats().then(setStats).catch(console.error);
  }, []);

  const filteredSuggestions = balitaList.filter((b) =>
    b.nama.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 4);

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const belumDiukurList = balitaList.filter((b) => {
    const isMeasured = b.pengukuran?.some((p) => p.bulan === currentMonth && p.tahun === currentYear);
    return !isMeasured;
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-black">
      <Navbar />

      <main className="p-4 sm:p-6 md:p-8 space-y-6 max-w-6xl mx-auto mt-2">
        
        <div className="bg-teal-600 rounded-3xl p-6 sm:p-8 md:p-10 text-white shadow-lg relative">
          <div className="flex justify-between items-start mb-6 relative z-10">
            <div>
              <p className="text-teal-50 text-sm font-medium opacity-90 mb-1">Halo, Kader 👋</p>
              <h2 className="text-xl sm:text-2xl font-bold">Posyandu Sidorejo Kidul</h2>
            </div>
            <div className="bg-white/20 px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl flex items-center gap-2 text-xs font-bold tracking-wide">
              <CalendarDays size={18} />
              {new Date().toLocaleDateString("id-ID", { month: "long", year: "numeric" })}
            </div>
          </div>
 
          <div className="relative z-10" ref={searchRef}>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Cari nama balita" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setIsFocused(true)}
              className="w-full pl-12 pr-6 py-3.5 rounded-2xl text-gray-800 focus:outline-none shadow-sm bg-white placeholder:text-gray-400 font-medium transition-all focus:ring-2 focus:ring-teal-200"
            />
 
            {isFocused && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-2">
                  {filteredSuggestions.length > 0 ? (
                    filteredSuggestions.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setSearchTerm(item.nama);
                          setIsFocused(false);
                          router.push(`/dashboard/balita/${item.id}`);
                        }}
                        className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors text-left group"
                      >
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 group-hover:bg-white group-hover:text-teal-500 transition-colors shrink-0">
                          <Search size={14} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-800">{item.nama}</p>
                          <p className="text-[10px] text-gray-500 font-medium">{item.jenisKelamin === "PEREMPUAN" ? "Perempuan" : "Laki-laki"}</p>
                        </div>
                      </button>
                    ))
                  ) : (
                    <p className="p-4 text-center text-xs text-gray-400 font-medium">Nama tidak ditemukan...</p>
                  )}
                  
                  <button 
                    onClick={() => router.push("/dashboard/cari")}
                    className="w-full p-3 mt-1 text-center text-xs font-bold text-teal-600 hover:bg-gray-50 rounded-xl border-t border-gray-50 transition-colors"
                  >
                    Lihat Semua Hasil
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
 
        {/* Responsive Desktop Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left Column: Stats & Aksi Cepat (spans 2 columns on lg) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="flex flex-col justify-between p-5 hover:border-blue-200 transition-colors shadow-sm bg-white">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div>
                  <p className="text-sm text-gray-800">Total balita</p>
                </div>
                <h3 className="text-3xl font-black text-gray-900">{stats?.totalBalita || 0}</h3>
              </Card>
              
              <Card className="flex flex-col justify-between p-5 hover:border-yellow-200 transition-colors shadow-sm bg-white">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2.5 h-2.5 bg-yellow-400 rounded-full"></div>
                  <p className="text-sm text-gray-800">Belum Hadir</p>
                </div>
                <h3 className="text-3xl font-black text-gray-900">{stats?.belumHadir || 0}</h3>
              </Card>
 
              <Card className="flex flex-col justify-between p-5 hover:border-teal-200 transition-colors shadow-sm bg-white">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2.5 h-2.5 bg-[#1fb999] rounded-full"></div>
                  <p className="text-sm text-gray-800">Hadir Bulan Ini</p>
                </div>
                <h3 className="text-3xl font-black text-gray-900">{stats?.hadirBulanIni || 0}</h3>
              </Card>
            </div>
 
            <Card className="p-6 shadow-sm border border-gray-200 bg-white">
              <h4 className="text-lg font-bold text-black mb-5">Aksi Cepat</h4>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { icon: Plus, label: "Tambah Balita", onClick: () => router.push("/dashboard/balita/tambah") },
                  { icon: PencilLine, label: "Input Pengukuran", onClick: () => router.push("/dashboard/cari?mode=ukur") },
                  { icon: PackageCheck, label: "Absen Bulanan", onClick: () => router.push("/dashboard/absen") }
                ].map((action, idx) => (
                  <button key={idx} onClick={action.onClick} className="group flex flex-col items-center justify-center gap-3 bg-[#f0fbf9] py-5 px-2 rounded-2xl transition-all duration-300 hover:bg-white hover:shadow-lg hover:shadow-teal-100 hover:-translate-y-1 hover:scale-[1.02] active:scale-95 border border-transparent hover:border-teal-100 cursor-pointer">
                    <div className="text-[#0d9488] transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3">
                      <action.icon size={28} strokeWidth={2} />
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-center text-[#0d9488] transition-colors duration-300 group-hover:text-teal-900">
                      {action.label}
                    </p>
                  </button>
                ))}
              </div>
            </Card>
          </div>
 
          {/* Right Column: Belum diukur list (spans 1 column on lg) */}
          <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <h4 className="text-base font-bold text-black">Belum diukur bulan ini</h4>
              <span className="text-sm font-medium text-gray-500">{belumDiukurList.length} balita</span>
            </div>
 
            <div className="space-y-3">
              {belumDiukurList.length > 0 ? (
                belumDiukurList.map((item) => (
                  <Card key={item.id} onClick={() => router.push(`/dashboard/balita/${item.id}`)} className="p-4 flex items-center justify-between group cursor-pointer hover:border-gray-300 transition-all shadow-sm bg-white">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                        item.jenisKelamin === "PEREMPUAN" ? "bg-[#fce5f1] text-pink-500" : "bg-[#e5f5fd] text-sky-500"
                      }`}>
                        <Baby size={24} />
                      </div>
                      <div>
                        <h5 className="text-sm font-bold text-black">{item.nama}</h5>
                        <p className="text-xs text-gray-700 mt-0.5">
                          {item.namaWali} • {item.alamat} RT {item.rt}/RW {item.rw}
                        </p>
                      </div>
                    </div>
                    <div className="bg-[#fff5ea] text-orange-600 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap">
                      Belum diukur
                    </div>
                  </Card>
                ))
              ) : (
                <p className="text-center py-6 text-xs text-gray-400 font-medium">Semua balita sudah diukur bulan ini! 🎉</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
