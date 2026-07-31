"use client";

import { useEffect, useRef, useState } from "react";
import { PROBLEMS } from "../lib/problems";

const POLL_INTERVAL_MS = 2500;
const POLL_TIMEOUT_MS = 90000;
const MAX_CODE_LENGTH = 20000;

export default function Page() {
  const [mode, setMode] = useState("paste"); // "paste" | "file"
  const [code, setCode] = useState("");
  const [fileName, setFileName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [problemId, setProblemId] = useState(PROBLEMS[0]?.id ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submissionId, setSubmissionId] = useState(null);
  const [result, setResult] = useState(null); // null trong khi đang chấm
  const [timedOut, setTimedOut] = useState(false);

  const pollTimer = useRef(null);
  const pollStartedAt = useRef(null);

  useEffect(() => {
    return () => {
      if (pollTimer.current) clearInterval(pollTimer.current);
    };
  }, []);

  function stopPolling() {
    if (pollTimer.current) {
      clearInterval(pollTimer.current);
      pollTimer.current = null;
    }
  }

  function startPolling(id) {
    stopPolling();
    pollStartedAt.current = Date.now();
    setTimedOut(false);

    pollTimer.current = setInterval(async () => {
      if (Date.now() - pollStartedAt.current > POLL_TIMEOUT_MS) {
        stopPolling();
        setTimedOut(true);
        return;
      }
      try {
        const res = await fetch(`/api/status/${id}`, { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) {
          stopPolling();
          setError(data.error || "Có lỗi khi kiểm tra kết quả.");
          return;
        }
        if (data.status && data.status !== "pending") {
          setResult(data);
          stopPolling();
        } else if (data.status === "pending") {
          // vẫn đang chấm, tiếp tục polling
        } else {
          // result.json không có "status" pending nghĩa là đã có kết quả cuối
          setResult(data);
          stopPolling();
        }
      } catch {
        // lỗi mạng tạm thời khi poll, thử lại ở lần sau
      }
    }, POLL_INTERVAL_MS);
  }

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const lowerName = file.name.toLowerCase();
    if (!lowerName.endsWith(expectedExt)) {
      setError(
        `Đề bài này yêu cầu nộp file ${expectedExt} (bạn vừa chọn file "${file.name}"). Vui lòng kiểm tra lại đề bài hoặc file.`
      );
      e.target.value = "";
      return;
    }

    setError("");
    const text = await file.text();
    setCode(text);
    setFileName(file.name);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setResult(null);
    setSubmissionId(null);

    if (!code.trim()) {
      setError("Vui lòng dán hoặc tải lên mã nguồn trước khi nộp bài.");
      return;
    }
    if (!studentId.trim()) {
      setError("Vui lòng nhập mã số sinh viên.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, studentId, problemId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Không thể nộp bài. Vui lòng thử lại.");
        setSubmitting(false);
        return;
      }
      setSubmissionId(data.submissionId);
      startPolling(data.submissionId);
    } catch {
      setError("Không thể kết nối tới máy chủ. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  }

  const isPending = submissionId && !result && !timedOut;
  const currentProblem = PROBLEMS.find((p) => p.id === problemId) || PROBLEMS[0];
  const isCpp = currentProblem?.language === "cpp";
  const expectedExt = isCpp ? ".cpp" : ".c";
  const codePlaceholder = isCpp
    ? `#include <iostream>\nusing namespace std;\n\nint main() {\n    // code cua ban o day\n    return 0;\n}`
    : `#include <stdio.h>\n\nint main(void) {\n    // code cua ban o day\n    return 0;\n}`;

  return (
    <div className="page">
      <p className="eyebrow">PRF192 PRF193 CSD202 · CF · FPT University Grading</p>
      <h1 className="title">Nộp bài & xem kết quả chấm điểm C</h1>
      <p className="subtitle">
        Dán mã nguồn hoặc tải lên file .c, chọn đề bài và mã số sinh viên. Hệ
        thống sẽ tự động biên dịch, chạy test và trả điểm ngay trên trang này.
      </p>

      <form className="card" onSubmit={handleSubmit}>
        <div className="field-row">
          <div className="field">
            <label htmlFor="problemId">Đề bài</label>
            <select
              id="problemId"
              value={problemId}
              onChange={(e) => {
                setProblemId(e.target.value);
                setFileName("");
                setError("");
              }}
            >
              {PROBLEMS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
            <span className="char-count" style={{ display: "block", marginTop: 6 }}>
              Ngôn ngữ: {isCpp ? "C++" : "C"} (file {expectedExt})
            </span>
          </div>
          <div className="field">
            <label htmlFor="studentId">Mã số sinh viên</label>
            <input
              id="studentId"
              type="text"
              placeholder="VD: SV00123"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
            />
          </div>
        </div>

        <div className="tabs">
          <button
            type="button"
            className={`tab-button ${mode === "paste" ? "active" : ""}`}
            onClick={() => setMode("paste")}
          >
            Dán mã nguồn
          </button>
          <button
            type="button"
            className={`tab-button ${mode === "file" ? "active" : ""}`}
            onClick={() => setMode("file")}
          >
            Tải file .c
          </button>
        </div>

        {mode === "paste" ? (
          <textarea
            className="code-input"
            placeholder={codePlaceholder}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
          />
        ) : (
          <div className="file-drop">
            Chọn file mã nguồn ({expectedExt}) từ máy tính của bạn
            <input type="file" accept={`${expectedExt},text/plain`} onChange={handleFileChange} />
            {fileName && <div className="file-name">Đã chọn: {fileName}</div>}
          </div>
        )}

        <div className="submit-row">
          <span className="char-count">
            {code.length}/{MAX_CODE_LENGTH} ký tự
          </span>
          <button className="submit-button" type="submit" disabled={submitting || isPending}>
            {submitting ? "Đang gửi..." : "Nộp bài chấm điểm"}
          </button>
        </div>

        {error && <div className="error-banner" style={{ marginTop: 16 }}>{error}</div>}
      </form>

      {isPending && (
        <div className="result-card">
          <div className="status-pending">
            <span className="dot-flash" />
            Đang biên dịch và chấm điểm... (thường mất 15–60 giây)
          </div>
        </div>
      )}

      {timedOut && !result && (
        <div className="result-card">
          <p className="plain-message">
            Việc chấm điểm đang mất nhiều thời gian hơn dự kiến. Bài nộp của bạn
            vẫn đang được xử lý — hãy tải lại trang sau ít phút, hoặc liên hệ
            giảng viên nếu tình trạng này kéo dài.
          </p>
        </div>
      )}

      {result && <ResultView result={result} />}

      <p className="footer-note">Mã bài nộp: {submissionId || "—"}</p>
	  <p className="footer-note">Copyright Huyvv CF FPTU</p>
    </div>
  );
}

function ResultView({ result }) {
  if (result.status === "error") {
    return (
      <div className="result-card">
        <p className="result-meta-title">Không thể chấm điểm bài này</p>
        <p className="plain-message">{result.message}</p>
      </div>
    );
  }

  if (result.status === "compile_error") {
    return (
      <div className="result-card">
        <div className="result-header">
          <div className="score-stamp" style={{ color: "var(--accent-fail)", borderColor: "var(--accent-fail)" }}>
            0
          </div>
          <div>
            <p className="result-meta-title">Lỗi biên dịch</p>
            <p className="result-meta-sub">Chương trình không biên dịch được, chưa chạy được test nào.</p>
          </div>
        </div>
        <pre className="compile-log">{result.compile_log || "(không có log)"}</pre>
      </div>
    );
  }

  // status === "graded"
  const passColor = result.score >= 50 ? "var(--accent-pass)" : "var(--accent-fail)";

  return (
    <div className="result-card">
      <div className="result-header">
        <div className="score-stamp" style={{ color: passColor, borderColor: passColor }}>
          {result.score}
        </div>
        <div>
          <p className="result-meta-title">
            Đạt {result.passed}/{result.total} test case
          </p>
          <p className="result-meta-sub">Chấm lúc {formatTime(result.graded_at)}</p>
        </div>
      </div>

      <ul className="test-list">
        {result.tests.map((t) => (
          <li className="test-row" key={t.name}>
            <span className={`test-icon ${t.passed ? "pass" : "fail"}`}>{t.passed ? "✓" : "✗"}</span>
            <div className="test-body">
              <div className="test-name-row">
                <span>Test {t.name}</span>
                <span className="test-elapsed">{t.elapsed_seconds}s</span>
              </div>
              {!t.passed && t.reason && <div className="test-reason">{describeReason(t.reason)}</div>}
              {!t.passed && (t.expected !== undefined || t.actual !== undefined) && (
                <div className="diff-block">
                  <div className="diff-line">
                    <span className="diff-label">Kết quả mong đợi</span>
                    {t.expected}
                  </div>
                  <div className="diff-line">
                    <span className="diff-label">Kết quả chương trình in ra</span>
                    {t.actual || "(không có output)"}
                  </div>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>

      {result.compile_log && result.compile_log.trim() && (
        <details style={{ marginTop: 16 }}>
          <summary style={{ cursor: "pointer", fontSize: 13, color: "var(--ink-soft)" }}>
            Xem cảnh báo biên dịch (warnings)
          </summary>
          <pre className="compile-log" style={{ marginTop: 8 }}>
            {result.compile_log}
          </pre>
        </details>
      )}
    </div>
  );
}

function describeReason(reason) {
  if (reason === "timeout") return "Chương trình chạy quá thời gian cho phép (có thể do vòng lặp vô hạn).";
  if (reason.startsWith("exit_code_")) return `Chương trình kết thúc với lỗi (mã thoát ${reason.replace("exit_code_", "")}).`;
  if (reason.startsWith("runtime_error")) return "Chương trình gặp lỗi khi chạy (ví dụ: lỗi truy cập bộ nhớ).";
  return reason;
}

function formatTime(isoString) {
  if (!isoString) return "";
  try {
    return new Date(isoString).toLocaleString("vi-VN");
  } catch {
    return isoString;
  }
}
