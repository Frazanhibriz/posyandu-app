"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Baby, ChevronDown } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Card from "@/components/ui/Card";
import { getBalitaById, updateBalita } from "@/lib/api";
import { Balita } from "@/types";
import { useToast } from "@/components/ui/Toast";

const MONTH_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export default function EditBalitaPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [balita, setBalita] = useState<Balita | null>(null);
  const { success } = useToast();
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const monthOptions = MONTH_NAMES.slice(0, currentMonth);

  // Bind fields to state
  const [name, setName] = useState("");
  const [mom, setMom] = useState("");
  const [address, setAddress] = useState("");
  const [rt, setRt] = useState("");
  const [rw, setRw] = useState("");
  const [gender, setGender] = useState("");
  const [nikBayi, setNikBayi] = useState("");
  const [nikWali, setNikWali] = useState("");
  const [selectedMeasurementMonth, setSelectedMeasurementMonth] =
    useState(currentMonth);
  const [panjangPengukuran, setPanjangPengukuran] = useState("");
  const [beratPengukuran, setBeratPengukuran] = useState("");
  const [lingkarKepalaPengukuran, setLingkarKepalaPengukuran] = useState("");
  const [lingkarLenganPengukuran, setLingkarLenganPengukuran] = useState("");

  const fillMeasurementFields = useCallback(
    (source: Balita, month: number) => {
      const measurement = source.pengukuran?.find(
        (p) => p.bulan === month && p.tahun === currentYear,
      );

      setPanjangPengukuran(measurement?.tinggiBadan?.toString() || "");
      setBeratPengukuran(measurement?.beratBadan?.toString() || "");
      setLingkarKepalaPengukuran(measurement?.lingkarKepala?.toString() || "");
      setLingkarLenganPengukuran(measurement?.lingkarLengan?.toString() || "");
    },
    [
      currentYear,
      setPanjangPengukuran,
      setBeratPengukuran,
      setLingkarKepalaPengukuran,
      setLingkarLenganPengukuran,
    ],
  );

  useEffect(() => {
    getBalitaById(id).then((found) => {
      if (found) {
        setBalita(found);
        setName(found.nama || "");
        setMom(found.namaWali || "");
        setAddress(found.alamat || "");
        setRt(found.rt || "");
        setRw(found.rw || "");
        setGender(
          found.jenisKelamin === "LAKI_LAKI" ? "Laki laki" : "Perempuan",
        );
        setNikBayi(found.nik || "");
        setNikWali(found.nikWali || "");
        fillMeasurementFields(found, currentMonth);
      }
    });
  }, [id, currentMonth, fillMeasurementFields]);

  if (!balita) {
    return (
      <div className="min-h-screen bg-gray-50 text-black font-sans flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-semibold text-gray-500">Memuat data...</p>
        </div>
      </div>
    );
  }

  const selectedMeasurement = balita.pengukuran?.find(
    (p) => p.bulan === selectedMeasurementMonth && p.tahun === currentYear,
  );
  const selectedMonthName = MONTH_NAMES[selectedMeasurementMonth - 1];

  return (
    <div className="min-h-screen bg-gray-50 text-black font-sans pb-10">
      <Navbar title="Edit Data Balita" />
      <main className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6 mt-2">
        <div className="flex items-center justify-between relative h-10">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors bg-white shadow-sm z-10 active:scale-95"
          >
            <ArrowLeft size={20} className="text-black" />
          </button>
          <h1 className="text-lg font-bold text-black absolute left-1/2 -translate-x-1/2 w-full text-center pointer-events-none">
            Edit Data Balita
          </h1>
        </div>

        <Card className="p-5 bg-white border border-gray-100 shadow-sm rounded-xl flex items-center gap-4">
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
            <h5 className="text-sm font-bold text-black">{balita.nama}</h5>
            <p className="text-xs text-gray-700 mt-1">
              {balita.jenisKelamin === "PEREMPUAN" ? "Perempuan" : "Laki-laki"}
            </p>
            <p className="text-xs text-gray-700 mt-0.5">
              {balita.namaWali} • {balita.alamat} RT {balita.rt}/RW {balita.rw}
            </p>
          </div>
        </Card>

        {/* Two Column Grid on Desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Data Utama Balita */}
          <div className="space-y-4">
            <p className="text-xs font-bold text-gray-500 ml-1">
              Data Utama Balita
            </p>
            <div className="space-y-1">
              <label className="text-xs font-bold text-black">
                Nama Balita
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-200 rounded-xl p-3.5 text-sm text-black font-bold focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white shadow-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-black">
                Nama Wali / Ibu
              </label>
              <input
                type="text"
                value={mom}
                onChange={(e) => setMom(e.target.value)}
                className="w-full border border-gray-200 rounded-xl p-3.5 text-sm text-black font-bold focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white shadow-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-black">
                Alamat Lengkap
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full border border-gray-200 rounded-xl p-3.5 text-sm text-black font-bold focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white shadow-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-black">RT</label>
                <input
                  type="text"
                  value={rt}
                  onChange={(e) =>
                    setRt(e.target.value.replace(/\D/g, "").substring(0, 3))
                  }
                  className="w-full border border-gray-200 rounded-xl p-3.5 text-sm text-black font-bold focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white shadow-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-black">RW</label>
                <input
                  type="text"
                  value={rw}
                  onChange={(e) =>
                    setRw(e.target.value.replace(/\D/g, "").substring(0, 3))
                  }
                  className="w-full border border-gray-200 rounded-xl p-3.5 text-sm text-black font-bold focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white shadow-sm"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-black">
                Jenis Kelamin
              </label>
              <div className="relative">
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full appearance-none bg-white border border-gray-200 rounded-xl p-3.5 text-sm font-bold text-black focus:outline-none focus:ring-1 focus:ring-teal-500 shadow-sm cursor-pointer"
                >
                  <option value="Laki laki">Laki laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
                <ChevronDown
                  size={20}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-black pointer-events-none"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Identitas Tambahan & Data Pengukuran Terbaru */}
          <div className="space-y-6">
            <div className="space-y-4">
              <p className="text-xs font-bold text-gray-500 ml-1">
                Identitas Tambahan
              </p>
              <div className="space-y-1">
                <label className="text-xs font-bold text-black">
                  NIK bayi / balita
                </label>
                <input
                  type="number"
                  placeholder="16 digit NIK"
                  value={nikBayi}
                  onChange={(e) => setNikBayi(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-3.5 text-sm text-black font-bold focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white shadow-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-black">NIK Wali</label>
                <input
                  type="number"
                  placeholder="16 digit NIK"
                  value={nikWali}
                  onChange={(e) => setNikWali(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-3.5 text-sm text-black font-bold focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-100">
              <div className="flex flex-col gap-1">
                <p className="text-xs font-bold text-gray-500 ml-1">
                  Data Pengukuran Tahun {currentYear}
                </p>
                <p className="text-[10px] font-medium text-gray-400 ml-1">
                  Pilih bulan untuk melihat data pengukuran pada periode
                  tersebut.
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-black">
                  Bulan Pengukuran
                </label>
                <div className="relative">
                  <select
                    value={selectedMeasurementMonth}
                    onChange={(e) => {
                      const month = Number(e.target.value);
                      setSelectedMeasurementMonth(month);
                      fillMeasurementFields(balita, month);
                    }}
                    className="w-full appearance-none bg-white border border-gray-200 rounded-xl p-3.5 text-sm font-bold text-black focus:outline-none focus:ring-1 focus:ring-teal-500 shadow-sm cursor-pointer"
                  >
                    {monthOptions.map((month, index) => (
                      <option key={month} value={index + 1}>
                        {month} {currentYear}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={20}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-black pointer-events-none"
                  />
                </div>
              </div>

              <div
                className={`rounded-xl border p-3.5 text-xs font-bold ${
                  selectedMeasurement
                    ? "border-teal-100 bg-[#f0fbf9] text-[#0d9488]"
                    : "border-orange-100 bg-[#fff5ea] text-orange-600"
                }`}
              >
                {selectedMeasurement
                  ? `Data pengukuran ${selectedMonthName} ${currentYear} ditemukan.`
                  : `Belum ada data pengukuran untuk ${selectedMonthName} ${currentYear}.`}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-black">
                    Panjang (cm)
                  </label>
                  <input
                    type="number"
                    value={panjangPengukuran}
                    onChange={(e) => setPanjangPengukuran(e.target.value)}
                    placeholder="0.0"
                    className="w-full border border-gray-200 rounded-xl p-3.5 text-sm text-black font-bold focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white shadow-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-black">
                    Berat (kg)
                  </label>
                  <input
                    type="number"
                    value={beratPengukuran}
                    onChange={(e) => setBeratPengukuran(e.target.value)}
                    placeholder="0.0"
                    className="w-full border border-gray-200 rounded-xl p-3.5 text-sm text-black font-bold focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white shadow-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-black">
                    L. Kepala (cm)
                  </label>
                  <input
                    type="number"
                    value={lingkarKepalaPengukuran}
                    onChange={(e) => setLingkarKepalaPengukuran(e.target.value)}
                    placeholder="0.0"
                    className="w-full border border-gray-200 rounded-xl p-3.5 text-sm text-black font-bold focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white shadow-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-black">
                    L. Lengan (cm)
                  </label>
                  <input
                    type="number"
                    value={lingkarLenganPengukuran}
                    onChange={(e) => setLingkarLenganPengukuran(e.target.value)}
                    placeholder="0.0"
                    className="w-full border border-gray-200 rounded-xl p-3.5 text-sm text-black font-bold focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white shadow-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={async () => {
            await updateBalita(id, {
              nama: name,
              namaWali: mom,
              alamat: address,
              rt: rt,
              rw: rw,
              jenisKelamin: gender.toLowerCase().includes("perempuan")
                ? "PEREMPUAN"
                : "LAKI_LAKI",
              nik: nikBayi,
              nikWali: nikWali,
            });
            success("Data balita berhasil diedit!");
            router.back();
          }}
          className="w-full bg-[#1fb999] hover:bg-teal-600 text-white font-bold py-4 rounded-xl transition-colors active:scale-95 shadow-md shadow-teal-100 mt-6 cursor-pointer"
        >
          Simpan Perubahan Data Balita
        </button>
      </main>
    </div>
  );
}
