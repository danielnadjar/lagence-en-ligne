import { prisma } from "./prisma";

// Génère un numéro de série unique pour les clients
// Acquéreur : ACQ-00001, Vendeur : VND-00001
export async function genererNumeroClient(typeClient: string = "ACQUEREUR"): Promise<string> {
  const prefix = typeClient === "VENDEUR" ? "VND" : "ACQ";

  const dernier = await prisma.client.findFirst({
    where: {
      numero: { startsWith: prefix },
    },
    orderBy: { createdAt: "desc" },
    select: { numero: true },
  });

  let suivant = 1;
  if (dernier?.numero) {
    const match = dernier.numero.match(new RegExp(`${prefix}-(\\d+)`));
    if (match) {
      suivant = parseInt(match[1], 10) + 1;
    }
  }

  return `${prefix}-${String(suivant).padStart(5, "0")}`;
}
