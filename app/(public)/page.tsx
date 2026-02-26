import { getServices } from "@/actions/services";
import { getActiveDaysOfWeek, getBlockedDatesPublic } from "@/actions/schedule";
import { BookingWizard } from "@/components/booking/booking-wizard";
import { Scissors, Clock, CalendarIcon, ChevronRight, CheckCircle2 } from "lucide-react";

export default async function HomePage() {
  const [services, activeDays, blockedDates] = await Promise.all([
    getServices(true),
    getActiveDaysOfWeek(),
    getBlockedDatesPublic(),
  ]);

  const servicesForWizard = services.map((s) => ({
    id: s.id,
    name: s.name,
    durationMinutes: s.durationMinutes,
    price: Number(s.price),
  }));

  const animationDelays = ["delay-0", "delay-100", "delay-200", "delay-300", "delay-500", "delay-700"];

  return (
    <div>

      {/* ═══════════════════════════════════════════════════
          SECCIÓN 1 — HERO
      ═══════════════════════════════════════════════════ */}
      <section
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at 50% 0%, rgba(251,191,36,0.09) 0%, transparent 60%), radial-gradient(ellipse at 85% 60%, rgba(251,191,36,0.04) 0%, transparent 50%)",
        }}
      >
        {/* Grid texture overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.025) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        {/* Bottom fade to next section */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-zinc-950 to-transparent pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both">

          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 bg-zinc-800/80 border border-zinc-700/50 text-amber-400 text-xs font-semibold px-4 py-1.5 rounded-full mb-8 tracking-widest uppercase">
            <Scissors className="w-3 h-3" />
            Chascomús · Buenos Aires
          </div>

          {/* Main heading */}
          <h1 className="text-6xl sm:text-7xl md:text-8xl font-bold tracking-widest uppercase text-white mb-4 leading-none">
            BARBERÍA<br />COBRÁN
          </h1>

          {/* Decorative line under heading */}
          <div className="flex items-center justify-center gap-3 mb-5">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-amber-400" />
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-amber-400" />
          </div>

          {/* Subheading */}
          <p className="text-amber-400/80 text-sm md:text-base tracking-[0.3em] uppercase font-medium mb-5">
            Corte · Barba · Estilo
          </p>

          {/* Body text */}
          <p className="text-zinc-400 text-base md:text-lg max-w-md mx-auto mb-10 leading-relaxed">
            Reservá tu turno online en segundos. Sin llamadas, sin esperas.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#reservar"
              className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-zinc-900 font-bold px-8 py-4 rounded-xl text-sm tracking-wider uppercase transition-colors animate-pulse-amber"
            >
              <CalendarIcon className="w-4 h-4" />
              Reservar Turno
            </a>
            <a
              href="#servicios"
              className="inline-flex items-center gap-2 text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 px-8 py-4 rounded-xl text-sm tracking-wider uppercase transition-colors"
            >
              Ver servicios
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          SECCIÓN 2 — SERVICIOS
      ═══════════════════════════════════════════════════ */}
      <section id="servicios" className="py-24 px-6 scroll-mt-20">
        <div className="max-w-7xl mx-auto">

          {/* Heading */}
          <div className="text-center mb-16">
            <p className="text-amber-400 text-xs tracking-widest uppercase font-semibold mb-3">
              Lo que hacemos
            </p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-wide uppercase text-white">
              Nuestros Servicios
            </h2>
            <div className="flex items-center justify-center gap-3 mt-4">
              <div className="h-px w-12 bg-amber-400/40" />
              <div className="w-1 h-1 rounded-full bg-amber-400/40" />
              <div className="h-px w-12 bg-amber-400/40" />
            </div>
          </div>

          {/* Services grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {services.map((service, index) => (
              <a
                key={service.id}
                href="#reservar"
                className={`group relative bg-zinc-900 border border-zinc-800 hover:border-amber-400/50 rounded-2xl p-6 transition-all duration-300 hover:bg-zinc-800/80 cursor-pointer animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both ${animationDelays[index] ?? "delay-0"}`}
              >
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-zinc-800 group-hover:bg-amber-400/10 border border-zinc-700 group-hover:border-amber-400/30 flex items-center justify-center mb-4 transition-all">
                  <Scissors className="w-6 h-6 text-zinc-500 group-hover:text-amber-400 transition-colors" />
                </div>

                {/* Name */}
                <h3 className="font-bold text-white text-sm uppercase tracking-wide mb-2 group-hover:text-amber-400 transition-colors leading-tight">
                  {service.name}
                </h3>

                {/* Duration */}
                <p className="text-zinc-500 text-xs flex items-center gap-1 mb-4">
                  <Clock className="w-3 h-3" />
                  {service.durationMinutes} min
                </p>

                {/* Price */}
                <p className="text-amber-400 font-bold text-xl">
                  ${Number(service.price).toLocaleString("es-AR")}
                </p>
              </a>
            ))}
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          SECCIÓN 3 — CÓMO FUNCIONA
      ═══════════════════════════════════════════════════ */}
      <section className="py-24 px-6 bg-zinc-900/30">
        <div className="max-w-5xl mx-auto">

          {/* Heading */}
          <div className="text-center mb-16">
            <p className="text-amber-400 text-xs tracking-widest uppercase font-semibold mb-3">
              Simple y rápido
            </p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-wide uppercase text-white">
              ¿Cómo reservar?
            </h2>
          </div>

          {/* Steps */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-10 md:gap-0">

            {/* Step 1 */}
            <div className="flex-1 text-center px-6">
              <div className="w-16 h-16 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center mx-auto mb-4">
                <Scissors className="w-7 h-7 text-amber-400" />
              </div>
              <div className="text-amber-400/20 text-6xl font-bold mb-2 leading-none">01</div>
              <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-3">
                Elegí tu servicio
              </h3>
              <p className="text-zinc-500 text-sm leading-relaxed max-w-xs mx-auto">
                Corte, barba o combo. Ves el precio y la duración antes de confirmar.
              </p>
            </div>

            {/* Arrow (desktop) */}
            <div className="hidden md:flex items-center justify-center self-center pb-20">
              <ChevronRight className="w-6 h-6 text-zinc-700" />
            </div>

            {/* Step 2 */}
            <div className="flex-1 text-center px-6">
              <div className="w-16 h-16 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center mx-auto mb-4">
                <CalendarIcon className="w-7 h-7 text-amber-400" />
              </div>
              <div className="text-amber-400/20 text-6xl font-bold mb-2 leading-none">02</div>
              <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-3">
                Elegí día y hora
              </h3>
              <p className="text-zinc-500 text-sm leading-relaxed max-w-xs mx-auto">
                Solo se muestran los horarios disponibles. Sin sorpresas ni llamadas.
              </p>
            </div>

            {/* Arrow (desktop) */}
            <div className="hidden md:flex items-center justify-center self-center pb-20">
              <ChevronRight className="w-6 h-6 text-zinc-700" />
            </div>

            {/* Step 3 */}
            <div className="flex-1 text-center px-6">
              <div className="w-16 h-16 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-7 h-7 text-amber-400" />
              </div>
              <div className="text-amber-400/20 text-6xl font-bold mb-2 leading-none">03</div>
              <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-3">
                ¡Listo!
              </h3>
              <p className="text-zinc-500 text-sm leading-relaxed max-w-xs mx-auto">
                Recibís la confirmación al instante. Guardá tu número para consultar el estado.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          SECCIÓN 4 — WIZARD DE RESERVAS
      ═══════════════════════════════════════════════════ */}
      <section id="reservar" className="py-24 px-6 scroll-mt-20">
        <div className="max-w-2xl mx-auto">

          {/* Heading */}
          <div className="text-center mb-10">
            <p className="text-amber-400 text-xs tracking-widest uppercase font-semibold mb-3">
              Online · 24/7
            </p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-wide uppercase text-white mb-3">
              Reservar Turno
            </h2>
            <p className="text-zinc-400 text-sm">
              Elegí el servicio, la fecha y el horario que más te convenga
            </p>
            <div className="flex items-center justify-center gap-3 mt-4">
              <div className="h-px w-12 bg-amber-400/40" />
              <div className="w-1 h-1 rounded-full bg-amber-400/40" />
              <div className="h-px w-12 bg-amber-400/40" />
            </div>
          </div>

          {/* Booking wizard — sin cambios */}
          <BookingWizard
            services={servicesForWizard}
            activeDays={activeDays}
            blockedDates={blockedDates}
          />

        </div>
      </section>

    </div>
  );
}
