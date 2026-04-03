import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, role: true, actif: true },
    });
    return NextResponse.json({ status: "OK", database: "connected", users: users.length, details: users });
  } catch (error) {
    return NextResponse.json({ status: "ERROR", database: "not connected", error: error.message }, { status: 500 });
  }
}
