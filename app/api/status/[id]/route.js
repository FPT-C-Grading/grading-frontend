import { NextResponse } from "next/server";
import { getResult } from "../../../../lib/github";

export async function GET(_request, { params }) {
  const { id } = params;

  if (!id || !/^[a-zA-Z0-9_-]+$/.test(id)) {
    return NextResponse.json({ error: "Invalid submission ID." }, { status: 400 });
  }

  try {
    const result = await getResult(id);
    if (!result) {
      return NextResponse.json({ status: "pending" });
    }
    return NextResponse.json(result);
  } catch (err) {
    console.error("status error:", err);
    return NextResponse.json(
      { error: "Could not check the result right now. Please try again." },
      { status: 502 }
    );
  }
}
