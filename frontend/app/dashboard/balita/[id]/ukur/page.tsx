"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Baby } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Card from "@/components/ui/Card";
import { getBalitaById, addPengukuran } from "@/lib/api";
import { Balita, Pengukuran } from "@/types";

function calculateAgeInMonths(birthDate: string): number {
  const birth = new Date(birthDate);
  const now = new Date();
  const diffYears = now.getFullYear() - birth.getFullYear();
  const diffMonths = now.getMonth() - birth.getMonth();
  return diffYears * 12 + diffMonths;
}
import { useToast } from "@/components/ui/Toast";

const InputWithSuffix = ({ 
  label, 
  suffix, 
  value, 
  onChange, 
  sublabel = "",
  disabled = false,
  placeholder = "0.0"
}: { 
  label: string, 
  suffix: string, 
  value: string, 
  onChange: (val: string) => void, 
  sublabel?: string,
  disabled?: boolean,
  placeholder?: string
}) => (
  <div className="space-y-1">
    <div className="flex justify-between items-end">
      <label className="text-xs font-bold text-black">{label}</label>
      {sublabel && <span className="text-[9px] text-gray-400">{sublabel}</span>}
    </div>
    <div className={`relative flex rounded-xl border overflow-hidden transition-all shadow-sm ${
      disabled 
        ? "border-gray-100 bg-gray-50" 
        : "border-gray-200 focus-within:ring-2 focus-within:ring-teal-500/20 focus-within:border-teal-500 bg-white"
    }`}>
      <input 
        type="number" 
        step="any"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full p-3.5 pr-12 text-sm text-black font-bold outline-none bg-transparent placeholder:text-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed" 
      />
      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">{suffix}</span>
    </div>
  </div>
);

export default function UkurBalitaPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [balita, setBalita] = useState<Balita | null>(null);
  const { success, warning } = useToast();
  const [ageInMonths, setAgeInMonths] = useState<number | null>(null);

  // Form states
  const [tinggi, setTinggi] = useState("");
  const [berat, setBerat] = useState("");
  const [lingkarKepala, setLingkarKepala] = useState("");
  const [lingkarLengan, setLingkarLengan] = useState("");
  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();
  const currentMonthName = monthNames[currentMonth - 1];

  useEffect(() => {
    getBalitaById(id).then((found) => {
      setBalita(found);
      if (found?.tglLahir) {
        setAgeInMonths(calculateAgeInMonths(found.tglLahir));
      }
    });
  }, [id]);

  // Clean lingkarLengan if child is 6 months or under
  useEffect(() => {
    if (ageInMonths !== null && ageInMonths <= 6) {
      setLingkarLengan("");
    }
  }, [ageInMonths]);

  if (!balita) {
    return (
      <div className="min-h-screen bg-gray-50 text-black font-sans flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-semibold text-gray-500">Memuat data balita...</p>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    const isOver6Months = ageInMonths !== null && ageInMonths > 6;
    
    if (!tinggi || !berat || !lingkarKepala || (isOver6Months && !lingkarLengan)) {
      warning(isOver6Months ? "Harap isi semua data pengukuran!" : "Harap isi data panjang, berat, dan lingkar kepala!");
      return;
    }

    const newMeasurement: Omit<Pengukuran, 'id'> = {
      bulan: currentMonth,
      tahun: currentYear,
      beratBadan: parseFloat(berat),
      tinggiBadan: parseFloat(tinggi),
      lingkarKepala: lingkarKepala ? parseFloat(lingkarKepala) : null,
      lingkarLengan: lingkarLengan ? parseFloat(lingkarLengan) : null
    };

    await addPengukuran(id, newMeasurement);
    success('Pengukuran berhasil disimpan!');
    router.back();
  };

  const isLlaDisabled = ageInMonths !== null && ageInMonths <= 6;

  return (
    <div className="min-h-screen bg-gray-50 text-black font-sans pb-10">
      <Navbar title="Input Pengukuran" />
      
      <main className="p-4 sm:p-6 max-w-2xl mx-auto space-y-6 mt-2">
        <div className="flex items-center justify-between relative h-10">
          <button onClick={() => router.back()} className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors bg-white shadow-sm z-10 active:scale-95">
            <ArrowLeft size={20} className="text-black" />
          </button>
          <h1 className="text-lg font-bold text-black absolute left-1/2 -translate-x-1/2 w-full text-center pointer-events-none">Input Pengukuran</h1>
        </div>

        <Card className="p-5 bg-white border border-gray-100 shadow-sm rounded-xl flex items-center gap-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
            balita.jenisKelamin === "PEREMPUAN" ? "bg-[#fce5f1] text-pink-500" : "bg-[#e5f5fd] text-sky-500"
          }`}>
            <Baby size={24} />
          </div>
          <div>
            <h5 className="text-sm font-bold text-black">{balita.nama}</h5>
            <p className="text-xs text-gray-700 mt-1">{balita.jenisKelamin === "PEREMPUAN" ? "Perempuan" : "Laki-laki"}</p>
            <p className="text-xs text-gray-700 mt-0.5">{balita.namaWali} • {balita.alamat} RT {balita.rt}/RW {balita.rw}</p>
          </div>
        </Card>

        <div className="rounded-xl border border-teal-100 bg-[#f0fbf9] p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#0d9488]">
            Periode Pengukuran
          </p>
          <p className="mt-1 text-sm font-black text-gray-900">
            {currentMonthName} {currentYear}
          </p>
          <p className="mt-2 text-xs font-medium leading-relaxed text-gray-600">
            Input pengukuran ini hanya untuk bulan saat ini. Pengukuran bulan lain dilakukan melalui Edit Data Balita.
          </p>
        </div>

        <div className="space-y-4 pt-2">
          <p className="text-xs font-bold text-gray-500 ml-1">Data Pengukuran</p>
          <InputWithSuffix label="Panjang / Tinggi" suffix="cm" value={tinggi} onChange={setTinggi} />
          <InputWithSuffix label="Berat" suffix="kg" value={berat} onChange={setBerat} />
          <InputWithSuffix label="Lingkar Kepala" suffix="cm" value={lingkarKepala} onChange={setLingkarKepala} />
          <InputWithSuffix 
            label="Lingkar Lengan Atas" 
            suffix="cm" 
            value={lingkarLengan} 
            onChange={setLingkarLengan} 
            sublabel="Untuk balita usia > 6 bulan" 
            disabled={isLlaDisabled}
            placeholder={isLlaDisabled ? "Tidak wajib (≤ 6 bulan)" : "0.0"}
          />
        </div>

        <button 
          onClick={handleSave}
          className="w-full bg-[#1fb999] hover:bg-teal-600 text-white font-bold py-4 rounded-xl transition-colors active:scale-95 shadow-md shadow-teal-100 mt-6 cursor-pointer"
        >
          Simpan Pengukuran
        </button>
      </main>
    </div>
  );
}
