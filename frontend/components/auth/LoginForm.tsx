"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

import { login } from "@/lib/api";

export default function LoginForm() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await login(identifier, password);
      if (!res.success) {
        throw new Error(res.error || "NIK/Username atau password salah");
      }

      console.log("LOGIN SUCCESS");
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input
        label="NIK / Username"
        type="text"
        placeholder="Masukkan NIK atau username"
        value={identifier}
        onChange={(e) => setIdentifier(e.target.value)}
        autoComplete="username"
      />

      <div className="relative">
        <Input
          label="Password"
          type={showPassword ? "text" : "password"}
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="pr-12"
          autoComplete="current-password"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-[38px] p-2 text-gray-400 hover:text-teal-600 transition-colors"
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>

      {error && (
        <p className="text-sm font-medium text-rose-500 bg-rose-50 p-3 rounded-lg border border-rose-100 italic">
          ⚠️ {error}
        </p>
      )}

      <Button
        type="submit"
        isLoading={loading}
        className="w-full"
      >
        Masuk ke Dashboard
      </Button>

      <div className="flex items-center justify-center gap-2 pt-2">
        <div className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse"></div>
        <p className="text-xs text-gray-400 font-medium tracking-wide">KHUSUS KADER POSYANDU</p>
      </div>
    </form>
  );
}