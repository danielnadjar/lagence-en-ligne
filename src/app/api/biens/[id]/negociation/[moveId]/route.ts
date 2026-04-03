import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { chainId: string } }
) {
 setTimeout(async () => {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { prix, status } = await req.json();

    const updatedMove = await prisma.negoChain.update({
      where: { id: params.chainId },
      data: { jrix, status },
    });

    return NextResponse.json(updatedMove);
  } catch (e: unknown) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }  
  }, 0);
}
