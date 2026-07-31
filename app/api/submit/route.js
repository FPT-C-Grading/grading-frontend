import { NextResponse } from "next/server";
import { createSubmissionCommit } from "../../../lib/github";
import { PROBLEMS } from "../../../lib/problems";

const MAX_CODE_LENGTH = 20000;

function sanitizeId(value) {
  return (value || "").trim().replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 40);
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Dữ liệu gửi lên không hợp lệ." }, { status: 400 });
  }

  const { code, studentId, problemId } = body || {};

  if (!code || typeof code !== "string" || !code.trim()) {
    return NextResponse.json(
      { error: "Vui lòng dán hoặc tải lên mã nguồn trước khi nộp bài." },
      { status: 400 }
    );
  }
  if (code.length > MAX_CODE_LENGTH) {
    return NextResponse.json(
      { error: `Mã nguồn quá dài (tối đa ${MAX_CODE_LENGTH} ký tự).` },
      { status: 400 }
    );
  }

  const safeStudentId = sanitizeId(studentId);
  if (!safeStudentId) {
    return NextResponse.json(
      { error: "Mã số sinh viên không hợp lệ (chỉ được dùng chữ, số, gạch ngang, gạch dưới)." },
      { status: 400 }
    );
  }

  const problem = PROBLEMS.find((p) => p.id === problemId);
  if (!problem) {
    return NextResponse.json({ error: "Đề bài không hợp lệ." }, { status: 400 });
  }

  const submissionId = `${problem.id}__${safeStudentId}__${Date.now()}`;
  const sourceFilename = problem.language === "cpp" ? "main.cpp" : "main.c";

  try {
    await createSubmissionCommit(
      submissionId,
      code,
      {
        problem_id: problem.id,
        student_id: studentId.trim(),
        submitted_at: new Date().toISOString(),
        language: problem.language, // chỉ để lưu vết/tham khảo; grader không dùng trường này
      },
      sourceFilename
    );
  } catch (err) {
    console.error("submit error:", err);
    return NextResponse.json(
      { error: "Không thể gửi bài lên hệ thống chấm điểm. Vui lòng thử lại sau." },
      { status: 502 }
    );
  }

  return NextResponse.json({ submissionId });
}
