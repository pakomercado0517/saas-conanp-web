import Link from "next/link";
import Image from "next/image";
import {
  Waves,
  ShieldCheck,
  CalendarDays,
  BarChart3,
} from "lucide-react";
import { PricingSection } from "@/components/landing/PricingSection";
import { EmailSignupSection } from "@/components/landing/EmailSignupSection";

const DASHBOARD_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuC5knczInz3gux6d450KYLlx8UVh8xwqrloqMCHGKmGwjt72yx4IbjeXfjDjUiK426bi9HGnRX40v22jlGLOKgS-xtq7wVXlRTzpahTD-IRQMFOyQPr-H9I01kMOwidepfpFUa80dhztNKh3qAsO09iAhA-OYKHMLnWPglUfFqLGiOWldjoEq3H7_TXJV6tWPz8WhcoaZRD8jvI5a7gitZlKBeFKJ0S7DWadJr1T5_M_1k48aDVbJrZb4ZRuQUELy36K58nLHksLfmv";
const DATA_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCyKYH1U1wZUBQWgOMJQn6pNe__gPieotcA8Bv93wgxSux0AfgiXxskS7Se--l1YFx1WPgiDtiulQAlqY4bNG2cGfAA0r-6Z273rA2mRWCuLovnpgbu4binMupq2qqywbvEwPA-9c1-eWGx2VR23UwXl3ArFsiIpjouXhIyVupqEovKZOinXAj_1CmRF9uQnAcXBvu4mCjeAkDydApaTzq15NiYbk_9XZ-KnW59jLOGBAT5J-wqyca6PVQYAL2Vn3cjDcjx4YQRI68R";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-(--cyan-accent)/10 bg-(--navy-deep)/90 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <Waves className="h-8 w-8 text-(--cyan-accent)" strokeWidth={1.5} />
            <span className="text-xl font-bold tracking-tight text-white">
              CONANP <span className="text-(--cyan-accent)">ERP</span>
            </span>
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            <a
              href="#features"
              className="text-sm font-medium text-white/80 transition-colors hover:text-(--cyan-accent)"
            >
              Características
            </a>
            <a
              href="#dashboard"
              className="text-sm font-medium text-white/80 transition-colors hover:text-(--cyan-accent)"
            >
              Plataforma
            </a>
            <a
              href="#pricing"
              className="text-sm font-medium text-white/80 transition-colors hover:text-(--cyan-accent)"
            >
              Planes
            </a>
            <Link
              href="/auth/login"
              className="rounded bg-(--cyan-accent) px-5 py-2.5 font-bold text-(--navy-deep) transition-colors hover:bg-(--cyan-hover)"
            >
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="overflow-hidden bg-linear-to-br from-(--navy-deep) via-(--navy-deep) to-[#020c1b] pt-32 pb-20 lg:pt-48 lg:pb-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-12">
            <div className="space-y-8 text-left">
              <div className="inline-flex items-center rounded-full border border-(--cyan-accent)/30 bg-(--cyan-accent)/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-(--cyan-accent)">
                Solución Enterprise v2.0
              </div>
              <h1 className="text-5xl font-bold leading-tight text-white lg:text-6xl">
                Gestión Tecnológica para{" "}
                <span className="text-(--cyan-accent)">Áreas Naturales.</span>
              </h1>
              <p className="max-w-xl text-xl leading-relaxed text-(--slate-text)">
                Optimice la operación turística regulada con una infraestructura
                robusta, segura y escalable. Control total de permisos, activos
                y capacidad de carga.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap">
                <Link
                  href="/auth/login"
                  className="inline-flex items-center justify-center rounded bg-(--cyan-accent) px-8 py-4 font-bold text-(--navy-deep) shadow-lg shadow-(--cyan-accent)/10 transition-all hover:-translate-y-0.5"
                >
                  Iniciar sesión
                </Link>
                <Link
                  href="/auth/register"
                  className="inline-flex items-center justify-center gap-2 rounded border border-white/20 px-8 py-4 font-semibold text-white transition-colors hover:bg-white/5"
                >
                  ¿Tienes una invitación? Regístrate
                </Link>
                <a
                  href="#pricing"
                  className="inline-flex items-center justify-center rounded border border-(--cyan-accent)/40 px-8 py-4 font-semibold text-(--cyan-accent) transition-colors hover:bg-(--cyan-accent)/10"
                >
                  Ver planes
                </a>
              </div>
              <p className="text-sm text-(--slate-text)/80">
                El acceso a la plataforma es por invitación o por alta de un administrador.
              </p>
            </div>
            <div className="relative lg:ml-10">
              <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-(--cyan-accent) opacity-5 blur-[100px]" />
              <div className="relative overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur">
                <Image
                  src={DASHBOARD_IMAGE}
                  alt="Dashboard Mockup"
                  width={800}
                  height={500}
                  className="h-auto w-full object-cover opacity-90"
                  unoptimized
                />
                <div className="absolute inset-0 bg-linear-to-t from-(--navy-deep)/40 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features */}
      <section className="bg-white py-24" id="features">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-20 text-center">
            <h2 className="mb-4 text-4xl font-bold text-(--navy-deep)">
              Ecosistema Digital de Gestión
            </h2>
            <div className="mx-auto h-1 w-20 rounded-full bg-(--cyan-accent)" />
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <FeatureCard
              icon={ShieldCheck}
              title="Control de Operadores"
              description="Gestión centralizada de permisos turísticos, vigencias y requisitos legales por prestador."
            />
            <FeatureCard
              icon={CalendarDays}
              title="Agenda por Bloques"
              description="Planificación avanzada mediante bloques horarios dinámicos y control automático de capacidad."
            />
            <FeatureCard
              icon={BarChart3}
              title="Reportes Data-Centric"
              description="Visualización de datos operativos en tiempo real para la toma de decisiones estratégicas."
            />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <PricingSection />

      {/* Infrastructure */}
      <section className="overflow-hidden bg-white py-24" id="dashboard">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-16 lg:flex-row">
            <div className="lg:w-1/2">
              <h2 className="mb-6 text-4xl font-bold text-(--navy-deep)">
                Infraestructura Data-Driven
              </h2>
              <p className="mb-8 leading-relaxed text-slate-600">
                Nuestra arquitectura multi-tenant permite a cada ANP operar de
                manera independiente pero con estándares de seguridad
                unificados. Monitoree brazaletes, pasaportes y capacidad de
                carga en tiempo real.
              </p>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <div className="mb-1 text-4xl font-bold text-(--navy-deep)">
                    99.9%
                  </div>
                  <div className="text-sm font-bold uppercase tracking-wider text-(--cyan-accent)">
                    Uptime Garantizado
                  </div>
                </div>
                <div>
                  <div className="mb-1 text-4xl font-bold text-(--navy-deep)">
                    256-bit
                  </div>
                  <div className="text-sm font-bold uppercase tracking-wider text-(--cyan-accent)">
                    Encryption SSL
                  </div>
                </div>
              </div>
            </div>
            <div className="relative lg:w-1/2">
              <div className="rounded-2xl bg-(--navy-deep) p-2 shadow-2xl">
                <Image
                  src={DATA_IMAGE}
                  alt="Data View"
                  width={600}
                  height={400}
                  className="rounded-xl opacity-90"
                  unoptimized
                />
              </div>
              <div className="absolute -bottom-6 -left-6 flex items-center gap-3 rounded-xl bg-(--cyan-accent) p-6 shadow-xl text-(--navy-deep)">
                <BarChart3 className="h-8 w-8 font-bold" strokeWidth={2} />
                <div>
                  <p className="text-xs font-bold uppercase opacity-80">
                    Capacidad Total
                  </p>
                  <p className="text-2xl font-bold">84% Ocupado</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Email */}
      <EmailSignupSection />

      {/* Footer */}
      <footer className="border-t border-white/5 bg-(--navy-deep) py-12 text-white/50">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 px-4 sm:px-6 lg:px-8 md:flex-row">
          <Link href="/" className="flex items-center gap-2">
            <Waves className="h-6 w-6 text-(--cyan-accent)" strokeWidth={1.5} />
            <span className="font-bold tracking-tight text-white">
              CONANP <span className="text-(--cyan-accent)">ERP</span>
            </span>
          </Link>
          <div className="flex gap-8 text-sm">
            <a href="#" className="transition-colors hover:text-white">
              Privacidad
            </a>
            <a href="#" className="transition-colors hover:text-white">
              Términos
            </a>
            <a href="#" className="transition-colors hover:text-white">
              Soporte
            </a>
          </div>
          <div className="text-sm">
            © {new Date().getFullYear()} CONANP Sistema de Gestión Turística.
          </div>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="group rounded-xl border border-transparent bg-(--light-grey) p-8 transition-all hover:border-(--cyan-accent)/30 hover:shadow-xl">
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-lg bg-(--navy-deep) transition-colors group-hover:bg-(--cyan-accent)">
        <Icon className="h-7 w-7 text-(--cyan-accent) transition-colors group-hover:text-(--navy-deep)" />
      </div>
      <h3 className="mb-3 text-xl font-bold text-(--navy-deep)">{title}</h3>
      <p className="leading-relaxed text-slate-600">{description}</p>
    </div>
  );
}
