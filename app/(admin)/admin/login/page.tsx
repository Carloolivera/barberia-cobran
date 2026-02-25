import { LoginForm } from "@/components/admin/login-form";
import { Scissors } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-900">
      <div className="w-full max-w-sm p-8 bg-zinc-800 rounded-2xl shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-amber-400 rounded-full flex items-center justify-center mb-3">
            <Scissors className="w-7 h-7 text-zinc-900" />
          </div>
          <h1 className="text-white text-xl font-bold">Barbería Cobrán</h1>
          <p className="text-zinc-400 text-sm mt-1">Panel de administración</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
