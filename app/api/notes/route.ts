import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db/drizzle";
import { notes } from "@/lib/db/schema";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();

  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const data = await db.select().from(notes);
  return NextResponse.json(data);
}
