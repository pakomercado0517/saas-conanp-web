"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface DependenciaOperacionShellProps {
  dependenciaId: string;
  title: string;
  description?: string;
  /** Por defecto: hub de la dependencia. */
  backHref?: string;
  backLabel?: string;
  children: ReactNode;
}

/**
 * Cabecera de página dentro del layout con sidebar de dependencia (sin navbar ni footer globales).
 */
export function DependenciaOperacionShell({
  dependenciaId,
  title,
  description,
  backHref,
  backLabel = "Volver al panel de dependencia",
  children,
}: DependenciaOperacionShellProps) {
  const resolvedBack = backHref ?? `/dependencias/${dependenciaId}`;

  return (
    <div>
      <div className="mb-6">
        <Link
          href={resolvedBack}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-(--slate-text) transition-colors hover:text-(--cyan-accent)"
        >
          <ArrowLeft className="size-4" aria-hidden />
          {backLabel}
        </Link>
      </div>
      <header className="mb-8">
        <h1 className="text-2xl font-extrabold tracking-tight text-(--navy-deep) dark:text-white">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 text-sm text-(--slate-text)">{description}</p>
        ) : null}
      </header>
      {children}
    </div>
  );
}
