import LoginForm from "@/components/auth/LoginForm";
import Image from "next/image";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-100 px-5">
      
      <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <Image 
              src="/icons/logo-original.png" 
              alt="Mitra Posyandu Logo" 
              width={150} 
              height={150} 
              className="rounded-xl"
              priority
            />

          </div>
          <h1 className="text-3xl font-bold text-black">Mitra Posyandu</h1>
          <p className="text-sm text-black">
            Pencatatan & monitoring pertumbuhan balita
          </p>
      </div>

      <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-md">
        <LoginForm />
      </div>
    </div>
  );
}
