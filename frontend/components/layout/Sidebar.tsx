"use client";

import { 
  Home, 
  Baby, 
  ClipboardCheck, 
  BarChart3, 
  LogOut, 
  X
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logout } from "@/lib/api";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const menuItems = [
    {
      label: "Beranda",
      href: "/dashboard",
      icon: Home,
      description: "Ringkasan harian"
    },
    {
      label: "Balita",
      href: "/dashboard/balita",
      icon: Baby,
      description: "Daftar & data balita"
    },
    {
      label: "Absen",
      href: "/dashboard/absen",
      icon: ClipboardCheck,
      description: "Kehadiran bulanan"
    },
    {
      label: "Laporan",
      href: "/dashboard/laporan",
      icon: BarChart3,
      description: "Statistik Posyandu"
    }
  ];

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={onClose}
      />

      <div 
        className={`fixed inset-y-0 left-0 w-[300px] bg-white z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } flex flex-col`}
      >
        <div className="p-6 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-teal-500 rounded-xl flex items-center justify-center text-white">
              <Image 
                src="/icons/logo-original.png" 
                alt="Mitra Posyandu Logo" 
                width={300} 
                height={300} 
                className="rounded-xl"
                priority
              />
            </div>
            <div>
              <h2 className="font-bold text-lg leading-tight text-black">Mitra Posyandu</h2>
              <p className="text-xs text-gray-500 font-medium">Posyandu Sidorejo Kidul</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-black transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 p-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 px-2">Menu</p>
          
          <div className="space-y-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`
                    flex items-center justify-between p-3 rounded-xl transition-all relative overflow-hidden group
                    ${isActive 
                      ? "bg-teal-50/50 text-teal-600" 
                      : "text-gray-400 hover:bg-gray-50 hover:text-gray-800"
                    }
                  `}
                >
                  <div className="flex items-center gap-4">
                    <div className={isActive ? "text-teal-600" : "text-gray-400 group-hover:text-gray-600"}>
                      <item.icon size={22} />
                    </div>
                    <div>
                      <h4 className={`text-sm font-bold ${isActive ? "text-teal-600" : "text-gray-800"}`}>
                        {item.label}
                      </h4>
                      <p className="text-[10px] text-gray-400">{item.description}</p>
                    </div>
                  </div>
                  {isActive && (
                    <div className="w-1.5 h-6 bg-teal-600 rounded-full"></div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="p-6 border-t space-y-6">
          <div className="bg-gray-50 p-4 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#b8f5e6] flex items-center justify-center text-teal-800 font-bold text-sm">
              K
            </div>
            <div className="overflow-hidden">
              <h4 className="text-sm font-bold text-gray-800 truncate">Bu Kader</h4>
              <p className="text-[10px] text-gray-800 truncate">kader@posyandu.id</p>
            </div>
          </div>

          <button 
            onClick={async () => {
              await logout();
              router.push('/login');
              router.refresh();
            }}
            className="flex items-center justify-center gap-3 w-full text-rose-600 font-bold text-sm hover:bg-rose-50 p-3 rounded-xl transition-colors group cursor-pointer active:scale-95"
          >
            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
            Keluar
          </button>
        </div>
      </div>
    </>
  );
}

