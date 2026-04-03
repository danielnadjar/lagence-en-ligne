import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: { bienId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { prix, date, status } = await req.json();

    const negoMove = await prisma.negoChain.create({
      data: {
        bienId: params.bienId,
        prix,
        date,
        status,
        sequence: 1,
      },
    });

    return NextResponse.json(negoMove, { status: 201 });
  } catch (e: unknown) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { bienId: string, chainId: string } }
) {
 setTimeout(async () => {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    await prisma.negoChain.delete({ where: { id: params.chainId } });

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
  }, 0);
}
