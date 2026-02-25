export default function DependenciaLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-(--light-grey) dark:bg-(--navy-deep)">
      <div className="space-y-3 text-center">
        <div className="mx-auto size-10 animate-spin rounded-full border-4 border-slate-200 border-t-(--cyan-accent)" />
        <p className="text-sm text-(--slate-text)">Cargando dependencia...</p>
      </div>
    </div>
  );
}
