import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/migrate-statuts - Migration des anciens statuts vers les nouveaux
// À exécuter une seule fois après le déploiement
// ADMIN uniquement
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Admin requis" }, { status: 401 });
    }

    // Migrer les anciens statuts client
    const migrations = await Promise.all([
      // NOUVEAU → PROSPECT
      prisma.client.updateMany({
        where: { statut: "NOUVEAU" },
        data: { statut: "PROSPECT" },
      }),
      // EN_COURS → NEGOCIATION (approximation)
      prisma.client.updateMany({
        where: { statut: "EN_COURS" },
        data: { statut: "NEGOCIATION" },
      }),
      // CLOS → VENDU
      prisma.client.updateMany({
        where: { statut: "CLOS" },
        data: { statut: "VENDU" },
      }),
      // Ajouter typeClient = ACQUEREUR à tous les clients sans typeClient
      prisma.client.updateMany({
        where: {
          OR: [
            { typeClient: null as any },
            { typeClient: "" },
          ],
        },
        data: { typeClient: "ACQUEREUR" },
      }),
    ]);

    return NextResponse.json({
      ok: true,
      message: "Migration terminée",
      results: {
        nouveauToProspect: migrations[0].count,
        enCoursToNegociation: migrations[1].count,
        closToVendu: migrations[2].count,
        typeClientFixed: migrations[3].count,
      },
    });
  } catch (e: unknown) {
    return NextResponse.json(
      { error: "Erreur migration", details: e instanceof Error ? e.message : "unknown" },
      { status: 500 }
    );
  }
}
