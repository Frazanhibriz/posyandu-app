"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";

interface NavbarProps {
  title?: string;
}

export default function Navbar({ title = "Beranda" }: NavbarProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Sidebar isOpen={open} onClose={() => setOpen(false)} />
      
      <nav className="bg-white shadow-sm sticky top-0 z-30">
        
        <div className="flex items-center justify-between px-4 py-3">
          
          <div className="flex items-center gap-3">
            
            <button
              onClick={() => setOpen(true)}
              className="p-1 -ml-1 text-black hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-center"
            >
              <Menu size={24} strokeWidth={2.5} />
            </button>

            <h1 className="font-bold text-lg text-black">
              {title}
            </h1>

          </div>

          <div className="w-9 h-9 rounded-full bg-[#b8f5e6] flex items-center justify-center text-teal-800 font-bold text-sm">
            K
          </div>

        </div>

      </nav>
    </>
  );
}