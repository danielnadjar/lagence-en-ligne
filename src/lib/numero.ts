import { prisma } from "./prisma";

// Génère un numéro de série unique pour les clients : ACQ-00001, ACQ-00002, etc.
export async function genererNumeroClient(): Promise<string> {
  const dernier = await prisma.client.findFirst({
    orderBy: { createdAt: "desc" },
    select: { numero: true },
  });

  let suivant = 1;
  if (dernier?.numero) {
    const match = dernier.numero.match(/ACQ-(\d+)/);
    if (match) {
      suivant = parseInt(match[1], 10) + 1;
    }
  }

  return `ACQ-${String(suivant).padStart(5, "0")}`;
}
