"use client";

import { useState, useEffect, Suspense } from "react";
import { Search, ArrowLeft, Baby } from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Card from "@/components/ui/Card";
import { getBalitaList } from "@/lib/api";
import { Balita } from "@/types";

function CariBalitaContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [balitaList, setBalitaList] = useState<Balita[]>([]);
  const isMeasurementMode = searchParams.get("mode") === "ukur";
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    getBalitaList().then(setBalitaList);
  }, []);

  useEffect(() => {
    const nameParam = searchParams.get("name");
    if (nameParam) {
      setSearchTerm(nameParam);
    }
  }, [searchParams]);

  const selectableBalitaList = isMeasurementMode
    ? balitaList.filter((balita) => {
        const isMeasuredThisMonth = balita.pengukuran?.some(
          (p) => p.bulan === currentMonth && p.tahun === currentYear
        );
        return !isMeasuredThisMonth;
      })
    : balitaList;

  const filteredData = selectableBalitaList.filter((balita) =>
    balita.nama.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const emptyTitle = isMeasurementMode && selectableBalitaList.length === 0
    ? "Semua balita sudah diukur bulan ini"
    : "Yah, namanya tidak ketemu...";

  const emptyDescription = isMeasurementMode && selectableBalitaList.length === 0
    ? "Tidak ada balita yang perlu diinput pengukurannya untuk periode saat ini."
    : "Coba cek ejaannya lagi ya!";

  return (
    <div className="min-h-screen bg-gray-50 text-black font-sans">
      <Navbar title={isMeasurementMode ? "Input Pengukuran" : "Pilih Balita"} />

      <main className="p-4 sm:p-6 max-w-2xl mx-auto space-y-6 mt-2">
        
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors bg-white shrink-0 shadow-sm">
            <ArrowLeft size={20} className="text-black" />
          </Link>
          <h1 className="text-xl font-bold text-black">
            {isMeasurementMode ? "Pilih balita yang belum diukur" : "Pilih balita"}
          </h1>
        </div>

        {isMeasurementMode && (
          <div className="rounded-xl border border-teal-100 bg-[#f0fbf9] p-4 shadow-sm">
            <p className="text-xs font-bold text-[#0d9488]">
              Hanya menampilkan balita yang belum diukur pada bulan ini.
            </p>
          </div>
        )}

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={20} />
          <input 
            type="text"
            placeholder="Cari nama balita" 
            className="pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl bg-white w-full focus:outline-none focus:ring-1 focus:ring-gray-300 text-sm shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="space-y-4">
          {filteredData.length > 0 ? (
            filteredData.map((balita) => (
              <Card 
                key={balita.id} 
                onClick={() => router.push(
                  isMeasurementMode
                    ? `/dashboard/balita/${balita.id}/ukur`
                    : `/dashboard/balita/${balita.id}`
                )}
                className="p-5 flex items-center gap-4 cursor-pointer hover:border-gray-300 transition-all border border-gray-100 shadow-sm rounded-xl bg-white"
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                  balita.jenisKelamin === "PEREMPUAN" ? "bg-[#fce5f1] text-pink-500" : "bg-[#e5f5fd] text-sky-500"
                }`}>
                  <Baby size={24} />
                </div>
                <div>
                  <h5 className="text-sm font-bold text-black">{balita.nama}</h5>
                  <p className="text-xs text-gray-700 mt-1">
                    {balita.jenisKelamin === "PEREMPUAN" ? "Perempuan" : "Laki-laki"}
                  </p>
                  {isMeasurementMode && (
                    <p className="text-[10px] font-bold text-orange-600 mt-2">
                      Belum diukur bulan ini
                    </p>
                  )}
                  <p className="text-xs text-gray-700 mt-0.5">
                    {balita.namaWali} • {balita.alamat} RT {balita.rt}/RW {balita.rw}
                  </p>
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                <Search size={30} />
              </div>
              <p className="text-sm font-bold text-gray-400">{emptyTitle}</p>
              <p className="text-[10px] text-gray-500">{emptyDescription}</p>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}

export default function CariBalitaPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 text-black font-sans flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-semibold text-gray-500">Memuat pencarian...</p>
        </div>
      </div>
    }>
      <CariBalitaContent />
    </Suspense>
  );
}
