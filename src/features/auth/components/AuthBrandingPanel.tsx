import Link from "next/link";
import Image from "next/image";
import { Waves, Leaf } from "lucide-react";

const DASHBOARD_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuC5knczInz3gux6d450KYLlx8UVh8xwqrloqMCHGKmGwjt72yx4IbjeXfjDjUiK426bi9HGnRX40v22jlGLOKgS-xtq7wVXlRTzpahTD-IRQMFOyQPr-H9I01kMOwidepfpFUa80dhztNKh3qAsO09iAhA-OYKHMLnWPglUfFqLGiOWldjoEq3H7_TXJV6tWPz8WhcoaZRD8jvI5a7gitZlKBeFKJ0S7DWadJr1T5_M_1k48aDVbJrZb4ZRuQUELy36K58nLHksLfmv";

export function AuthBrandingPanel() {
  return (
    <div className="relative flex flex-1 flex-col justify-between overflow-hidden bg-[var(--navy-deep)] p-8 lg:p-12">
      {/* Grid pattern */}
      <div
        className="pointer-events-none absolute top-4 right-4 h-16 w-16 opacity-20"
        aria-hidden
      >
        <div className="grid h-full w-full grid-cols-2 gap-1">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="rounded-sm bg-white/30"
            />
          ))}
        </div>
      </div>

      {/* Dashboard mockup */}
      <div className="relative z-10 mt-8 flex justify-center lg:mt-0">
        <div className="relative w-full max-w-md overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur">
          <Image
            src={DASHBOARD_IMAGE}
            alt="Dashboard CONANP ERP"
            width={600}
            height={400}
            className="h-auto w-full object-cover opacity-90"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--navy-deep)]/40 to-transparent" />
        </div>
      </div>

      {/* Copy */}
      <div className="relative z-10 mt-8 lg:mt-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-white"
        >
          <Waves
            className="h-8 w-8 text-[var(--cyan-accent)]"
            strokeWidth={1.5}
          />
          <span className="text-xl font-bold tracking-tight">
            CONANP <span className="text-[var(--cyan-accent)]">ERP</span>
          </span>
        </Link>
        <h2 className="mt-6 text-3xl font-bold leading-tight text-white lg:text-4xl">
          Protegiendo el{" "}
          <span className="text-[var(--cyan-accent)]">Capital Natural</span> a
          través de la <span className="text-[var(--cyan-accent)]">Innovación</span>
          .
        </h2>
        <p className="mt-4 text-[var(--slate-text)]">
          Sistema centralizado para la gestión de turismo sustentable y áreas
          protegidas.
        </p>
      </div>

      {/* Leaf decoration */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 text-[var(--cyan-accent)]/10"
        aria-hidden
      >
        <Leaf className="h-32 w-32 lg:h-40 lg:w-40" strokeWidth={0.5} />
      </div>
    </div>
  );
}
