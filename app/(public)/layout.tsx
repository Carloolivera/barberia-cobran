import Link from "next/link";
import { Scissors } from "lucide-react";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-950 text-white" style={{ fontFamily: "'Poppins', sans-serif" }}>
      {/* Header */}
      <header className="border-b border-zinc-800 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center">
              <Scissors className="w-4 h-4 text-zinc-900" />
            </div>
            <span className="font-bold tracking-wider text-white text-sm">BARBERÍA COBRÁN</span>
          </Link>
          <Link
            href="/mi-turno"
            className="text-sm text-zinc-400 hover:text-amber-400 transition-colors"
          >
            Mi turno
          </Link>
        </div>
      </header>

      {/* Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-6 text-center text-xs text-zinc-600 mt-12">
        © {new Date().getFullYear()} Barbería Cobrán · Todos los derechos reservados
      </footer>
    </div>
  );
}
