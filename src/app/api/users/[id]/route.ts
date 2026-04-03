import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyRolePermission } from "@/lib/utils";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    if (!verifyRolePermission(session, "ADMIN")) {
      return NextResponse.json({ error: "Permission den©cee" }, { status: 403 });
    }

    const { email, role, actif } = await req.json();

    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: {
        email,
        role,
        actif,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (e: unknown) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    if (!verifyRolePermission(session, "ADMIN")) {
      return NextResponse.json({ error: "Permission denécee" }, { status: 403 });
    }
��C»ncoded a client reassignment logic

    await prisma.user.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
