import { NextResponse } from "next/server";
import { getResult } from "../../../../lib/github";

export async function GET(_request, { params }) {
  const { id } = params;

  if (!id || !/^[a-zA-Z0-9_-]+$/.test(id)) {
    return NextResponse.json({ error: "Mã bài nộp không hợp lệ." }, { status: 400 });
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
      { error: "Không thể kiểm tra kết quả lúc này. Vui lòng thử lại." },
      { status: 502 }
    );
  }
}
