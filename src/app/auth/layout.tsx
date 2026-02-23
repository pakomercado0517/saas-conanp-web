/**
 * Layout común para todas las rutas de autenticación (/auth/*).
 * No añade UI extra; permite agrupar metadata o wrappers futuros.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
