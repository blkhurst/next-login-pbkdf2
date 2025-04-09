// app/api/users/route.ts
// import { db } from "@/lib/db/drizzle";
// import { users } from "@/lib/db/schema";
// import { NextResponse } from "next/server";
import { eq, lt, gte, ne } from "drizzle-orm";

// import { auth } from "@/lib/auth/auth";

// export const GET = auth(async function GET(req) {
//   const session = req.auth;
//   if (!session || session.user?.role !== "admin")
//     return NextResponse.json({ message: session }, { status: 401 });

//   try {
//     const data = await db.select().from(users);
//     return NextResponse.json(data);
//   } catch (err) {
//     console.error("DB error:", err);
//     return NextResponse.json("error", { status: 200 }); // Fallback to empty
//   }
// });

// export async function GET() {
//   try {
//     // const data = await db.select({email: users.email}).from(users).where(eq(users.id, 1));
//     const data = await db.select().from(users);
//     return NextResponse.json(data);
//   } catch (err) {
//     console.error("DB error:", err);
//     return NextResponse.json("error", { status: 200 }); // Fallback to empty
//   }
// }

// app/api/users/route.ts
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db/drizzle";
import { users } from "@/lib/db/schema";
import { NextResponse } from "next/server";

export const GET = auth(async function GET(req) {
  const session = req.auth;

  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const data = await db.select().from(users);
  return NextResponse.json(data);
});
