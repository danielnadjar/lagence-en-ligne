import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  // Show masked DATABASE_URL for debugging
  const dbUrl = process.env.DATABASE_URL || "NOT SET";
  const directUrl = process.env.DIRECT_URL || "NOT SET";

  // Mask password but show host/port
  const maskUrl = (url: string) => {
    try {
      const match = url.match(/postgresql:\/\/([^:]+):([^@]+)@(.+)/);
      if (match) {
        return `postgresql://${match[1]}:****@${match[3]}`;
      }
      return "INVALID FORMAT";
    } catch {
      return "PARSE ERROR";
    }
  };

  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, role: true, actif: true },
    });
<<<<<<< HEAD
    return NextResponse.json({
      status: "OK",
      database: "connected",
      usersCount: users.length,
      users,
      debug: {
        DATABASE_URL: maskUrl(dbUrl),
        DIRECT_URL: maskUrl(directUrl),
      },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "unknown error";
    return NextResponse.json({
      status: "ERROR",
      error: msg,
      debug: {
        DATABASE_URL: maskUrl(dbUrl),
        DIRECT_URL: maskUrl(directUrl),
      },
    }, { status: 500 });
=======
    return NextResponse.json({ status: "OK", database: "connected", usersCount: users.length, users });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "unknown error";
    return NextResponse.json({ status: "ERROR", error: msg }, { status: 500 });
>>>>>>> 0d1e6d633fab9d0d7165e9af302abd8043ada2e5
  }
}
