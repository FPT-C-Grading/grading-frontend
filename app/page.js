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
  const [result, setResult] = useState(null); // null while grading is in progress
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
          setError(data.error || "Something went wrong while checking the result.");
          return;
        }
        if (data.status && data.status !== "pending") {
          setResult(data);
          stopPolling();
        } else if (data.status === "pending") {
          // still grading, keep polling
        } else {
          // result.json with no "pending" status means a final result is ready
          setResult(data);
          stopPolling();
        }
      } catch {
        // transient network error while polling, retry on the next tick
      }
    }, POLL_INTERVAL_MS);
  }

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const lowerName = file.name.toLowerCase();
    if (!lowerName.endsWith(expectedExt)) {
      setError(
        `This problem requires a ${expectedExt} file (you selected "${file.name}"). Please check the problem or the file.`
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
      setError("Please paste or upload your source code before submitting.");
      return;
    }
    if (!studentId.trim()) {
      setError("Please enter your student ID.");
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
        setError(data.error || "Could not submit your solution. Please try again.");
        setSubmitting(false);
        return;
      }
      setSubmissionId(data.submissionId);
      startPolling(data.submissionId);
    } catch {
      setError("Could not connect to the server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const isPending = submissionId && !result && !timedOut;
  const currentProblem = PROBLEMS.find((p) => p.id === problemId) || PROBLEMS[0];
  const isCpp = currentProblem?.language === "cpp";
  const expectedExt = isCpp ? ".cpp" : ".c";
  const codePlaceholder = isCpp
    ? `#include <iostream>\nusing namespace std;\n\nint main() {\n    // your code here\n    return 0;\n}`
    : `#include <stdio.h>\n\nint main(void) {\n    // your code here\n    return 0;\n}`;

  return (
    <div className="page">
      <p className="eyebrow">FPT UNIVERSITY . Auto Grading C/C++ PRF192 PRF193 CSD202</p>
      <h1 className="title">Submit &amp; view your C grading results</h1>
      <p className="subtitle">
        Paste your source code or upload a .c file, choose the problem and
        enter your student ID. The system will automatically compile, run
        the tests, and show your score right on this page.
      </p>
	  <h2><a href="questions.html" target="_blank" title="Click here to get questions">Question list</a></h2>

      <form className="card" onSubmit={handleSubmit}>
        <div className="field-row">
          <div className="field">
            <label htmlFor="problemId">Problem</label>
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
              Language: {isCpp ? "C++" : "C"} (file {expectedExt})
            </span>
          </div>
          <div className="field">
            <label htmlFor="studentId">Student ID</label>
            <input
              id="studentId"
              type="text"
              placeholder="e.g. He210123"
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
            Paste code
          </button>
          <button
            type="button"
            className={`tab-button ${mode === "file" ? "active" : ""}`}
            onClick={() => setMode("file")}
          >
            Upload file
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
            Choose a source file ({expectedExt}) from your computer
            <input type="file" accept={`${expectedExt},text/plain`} onChange={handleFileChange} />
            {fileName && <div className="file-name">Selected: {fileName}</div>}
          </div>
        )}

        <div className="submit-row">
          <span className="char-count">
            {code.length}/{MAX_CODE_LENGTH} characters
          </span>
          <button className="submit-button" type="submit" disabled={submitting || isPending}>
            {submitting ? "Submitting..." : "Submit for grading"}
          </button>
        </div>

        {error && <div className="error-banner" style={{ marginTop: 16 }}>{error}</div>}
      </form>

      {isPending && (
        <div className="result-card">
          <div className="status-pending">
            <span className="dot-flash" />
            Compiling and grading... (usually takes 15–60 seconds)
          </div>
        </div>
      )}

      {timedOut && !result && (
        <div className="result-card">
          <p className="plain-message">
            Grading is taking longer than expected. Your submission is still
            being processed — reload this page in a few minutes, or contact
            your instructor if this persists.
          </p>
        </div>
      )}

      {result && <ResultView result={result} />}

      <p className="footer-note">Submission ID: {submissionId || "—"}</p>
    </div>
  );
}

function ResultView({ result }) {
  if (result.status === "error") {
    return (
      <div className="result-card">
        <p className="result-meta-title">This submission could not be graded</p>
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
            <p className="result-meta-title">Compile error</p>
            <p className="result-meta-sub">The program failed to compile, so no tests were run.</p>
          </div>
        </div>
        <pre className="compile-log">{result.compile_log || "(no log)"}</pre>
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
            Passed {result.passed}/{result.total} test cases
          </p>
          <p className="result-meta-sub">Graded at {formatTime(result.graded_at)}</p>
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
                    <span className="diff-label">Expected output</span>
                    {t.expected}
                  </div>
                  <div className="diff-line">
                    <span className="diff-label">Your program's output</span>
                    {t.actual || "(no output)"}
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
            View compiler warnings
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
  if (reason === "timeout") return "The program ran longer than the time limit (possibly an infinite loop).";
  if (reason.startsWith("exit_code_")) return `The program exited with an error (exit code ${reason.replace("exit_code_", "")}).`;
  if (reason.startsWith("runtime_error")) return "The program crashed while running (e.g. an invalid memory access).";
  return reason;
}

function formatTime(isoString) {
  if (!isoString) return "";
  try {
    return new Date(isoString).toLocaleString("en-US");
  } catch {
    return isoString;
  }
}
