import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const r = await fetch("http://localhost:8000/divine-identity", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await r.json();
  return NextResponse.json(data, { status: r.status });
}
