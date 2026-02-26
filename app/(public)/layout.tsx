import Link from "next/link";
import { Scissors } from "lucide-react";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-950 text-white" style={{ fontFamily: "'Poppins', sans-serif" }}>
      {/* Sticky header with backdrop blur */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-zinc-950/80 border-b border-zinc-800/50 px-4 py-4">
        <div className="max-w-7xl mx-auto px-2 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center">
              <Scissors className="w-4 h-4 text-zinc-900" />
            </div>
            <span className="font-bold tracking-widest text-white text-sm uppercase">
              Barbería Cobrán
            </span>
          </Link>
          <div className="flex items-center gap-6">
            <a
              href="#servicios"
              className="hidden sm:block text-xs text-zinc-400 hover:text-amber-400 transition-colors tracking-widest uppercase"
            >
              Servicios
            </a>
            <a
              href="#reservar"
              className="hidden sm:block text-xs text-zinc-400 hover:text-amber-400 transition-colors tracking-widest uppercase"
            >
              Reservar
            </a>
            <Link
              href="/mi-turno"
              className="text-xs text-zinc-400 hover:text-amber-400 transition-colors tracking-widest uppercase"
            >
              Mi turno
            </Link>
          </div>
        </div>
      </header>

      {/* Content — full width, each section manages its own container */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/60 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-xs text-zinc-600 tracking-wide">
          © {new Date().getFullYear()} Barbería Cobrán · Chascomús, Buenos Aires · Todos los derechos reservados
        </div>
      </footer>
    </div>
  );
}
