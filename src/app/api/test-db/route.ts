import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, role: true, actif: true },
    });
    return NextResponse.json({ status: "OK", database: "connected", usersCount: users.length, users });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "unknown error";
    return NextResponse.json({ status: "ERROR", error: msg }, { status: 500 });
  }
}
