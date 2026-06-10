"use client";

import { useState, useEffect } from "react";
import { Search, Baby } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Card from "@/components/ui/Card";
import { getBalitaList } from "@/lib/api";
import { Balita } from "@/types";

export default function DaftarBalitaPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [balitaList, setBalitaList] = useState<Balita[]>([]);

  useEffect(() => {
    getBalitaList().then(setBalitaList);
  }, []);

  const filteredData = balitaList.filter((balita) =>
    balita.nama.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-gray-50 text-black font-sans">
      <Navbar title="Daftar Balita" />

      <main className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6 mt-2">
        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10"
            size={20}
          />
          <input
            type="text"
            placeholder="Cari nama balita"
            className="pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl bg-white w-full focus:outline-none focus:ring-1 focus:ring-gray-300 text-sm shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredData.length > 0 ? (
            filteredData.map((balita) => (
              <Card
                key={balita.id}
                className="flex flex-col border border-gray-100 shadow-sm rounded-xl bg-white overflow-hidden"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                      balita.jenisKelamin === "PEREMPUAN"
                        ? "bg-[#fce5f1] text-pink-500"
                        : "bg-[#e5f5fd] text-sky-500"
                    }`}
                  >
                    <Baby size={24} />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-black">
                      {balita.nama}
                    </h5>
                    <p className="text-xs text-gray-700 mt-1">
                      {balita.jenisKelamin === "PEREMPUAN"
                        ? "Perempuan"
                        : "Laki-laki"}
                    </p>
                    <p className="text-xs text-gray-700 mt-0.5">
                      {balita.namaWali} • {balita.alamat} RT {balita.rt}/RW{" "}
                      {balita.rw}
                    </p>
                  </div>
                </div>

                <div className="border-t border-gray-100 mx-5 mt-4"></div>

                <div className="px-5 pt-4 flex items-center justify-between">
                  <div
                    className={`px-4 py-1.5 rounded-full text-xs font-bold ${
                      balita.pengukuran?.some(
                        (p) =>
                          p.bulan === currentMonth && p.tahun === currentYear,
                      )
                        ? "bg-[#e6fbf5] text-[#0d9488]"
                        : "bg-[#fff5ea] text-orange-600"
                    }`}
                  >
                    {balita.pengukuran?.some(
                      (p) =>
                        p.bulan === currentMonth && p.tahun === currentYear,
                    )
                      ? "Sudah diukur"
                      : "Belum diukur"}
                  </div>
                  <Link
                    href={`/dashboard/balita/${balita.id}`}
                    className="text-xs font-bold text-[#0d9488] hover:text-teal-900 transition-colors"
                  >
                    Lihat Detail &gt;
                  </Link>
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                <Search size={30} />
              </div>
              <p className="text-sm font-bold text-gray-400">
                Yah, namanya tidak ketemu...
              </p>
              <p className="text-[10px] text-gray-500">
                Coba cek ejaannya lagi ya!
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
