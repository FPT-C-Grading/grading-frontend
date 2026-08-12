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
    return NextResponse.json({ error: "Invalid request data." }, { status: 400 });
  }

  const { code, studentId, problemId } = body || {};

  if (!code || typeof code !== "string" || !code.trim()) {
    return NextResponse.json(
      { error: "Please paste or upload your source code before submitting." },
      { status: 400 }
    );
  }
  if (code.length > MAX_CODE_LENGTH) {
    return NextResponse.json(
      { error: `Source code is too long (maximum ${MAX_CODE_LENGTH} characters).` },
      { status: 400 }
    );
  }

  const safeStudentId = sanitizeId(studentId);
  if (!safeStudentId) {
    return NextResponse.json(
      { error: "Invalid student ID (only letters, numbers, hyphens, and underscores are allowed)." },
      { status: 400 }
    );
  }

  const problem = PROBLEMS.find((p) => p.id === problemId);
  if (!problem) {
    return NextResponse.json({ error: "Invalid problem." }, { status: 400 });
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
        language: problem.language, // for record-keeping only; the grader does not rely on this field
      },
      sourceFilename
    );
  } catch (err) {
    console.error("submit error:", err);
    return NextResponse.json(
      { error: "Could not submit your solution to the grading system. Please try again later." },
      { status: 502 }
    );
  }

  return NextResponse.json({ submissionId });
}
