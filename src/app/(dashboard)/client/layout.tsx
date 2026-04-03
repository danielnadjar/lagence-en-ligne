import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "CLIENT") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Header client */}
      <header className="bg-dark-900 border-b border-dark-700 px-6 py-4">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-lg font-bold text-white">Mon espace</h1>
            <p className="text-xs text-dark-400">
              L&apos;Agence en Ligne - Cellule de négociation
            </p>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-sm text-dark-300">{session.user?.name}</p>
            <a
              href="/api/auth/signout"
              className="text-xs text-dark-400 hover:text-red-400"
            >
              Déconnexion
            </a>
          </div>
        </div>
      </header>
      <main className="max-w-5xl mx-auto p-6">{children}</main>
    </div>
  );
}
