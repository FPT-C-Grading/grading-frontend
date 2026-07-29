const GITHUB_API = "https://api.github.com";

function authHeaders() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error("Thiếu biến môi trường GITHUB_TOKEN trên máy chủ.");
  }
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

function repoInfo() {
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || "main";
  if (!owner || !repo) {
    throw new Error("Thiếu biến môi trường GITHUB_OWNER hoặc GITHUB_REPO trên máy chủ.");
  }
  return { owner, repo, branch };
}

async function githubFetch(path, options = {}) {
  const res = await fetch(`${GITHUB_API}${path}`, {
    ...options,
    headers: { ...authHeaders(), ...(options.headers || {}) },
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    const err = new Error(`GitHub API trả về lỗi ${res.status}: ${body}`);
    err.status = res.status;
    throw err;
  }
  if (res.status === 204) return null;
  return res.json();
}

/**
 * Tạo MỘT commit duy nhất chứa cả main.c và meta.json cho một bài nộp.
 *
 * Vì sao không dùng "Create file" API gọi 2 lần (mỗi file 1 lần)?
 * -> Mỗi lần gọi sẽ tạo 1 commit riêng, commit đầu tiên (main.c) đã đủ
 *    khớp điều kiện "paths: submissions/**" nên sẽ kích hoạt workflow
 *    NGAY LẬP TỨC dù meta.json chưa tồn tại, gây chạy thừa 1 lần và có
 *    thể gây nhầm lẫn khi debug. Dùng Git Data API để gộp thành 1 commit
 *    atomic giúp workflow chỉ chạy đúng 1 lần với đầy đủ dữ liệu.
 */
export async function createSubmissionCommit(submissionId, sourceCode, meta) {
  const { owner, repo, branch } = repoInfo();

  // 1. Lấy SHA của commit mới nhất trên nhánh
  const ref = await githubFetch(`/repos/${owner}/${repo}/git/ref/heads/${branch}`);
  const latestCommitSha = ref.object.sha;

  // 2. Lấy tree gốc của commit đó
  const latestCommit = await githubFetch(`/repos/${owner}/${repo}/git/commits/${latestCommitSha}`);
  const baseTreeSha = latestCommit.tree.sha;

  // 3. Tạo blob (nội dung file) cho main.c và meta.json
  const mainBlob = await githubFetch(`/repos/${owner}/${repo}/git/blobs`, {
    method: "POST",
    body: JSON.stringify({ content: sourceCode, encoding: "utf-8" }),
  });
  const metaBlob = await githubFetch(`/repos/${owner}/${repo}/git/blobs`, {
    method: "POST",
    body: JSON.stringify({ content: JSON.stringify(meta, null, 2), encoding: "utf-8" }),
  });

  // 4. Tạo tree mới, kế thừa tree gốc và thêm 2 file mới vào submissions/{id}/
  const newTree = await githubFetch(`/repos/${owner}/${repo}/git/trees`, {
    method: "POST",
    body: JSON.stringify({
      base_tree: baseTreeSha,
      tree: [
        {
          path: `submissions/${submissionId}/main.c`,
          mode: "100644",
          type: "blob",
          sha: mainBlob.sha,
        },
        {
          path: `submissions/${submissionId}/meta.json`,
          mode: "100644",
          type: "blob",
          sha: metaBlob.sha,
        },
      ],
    }),
  });

  // 5. Tạo commit mới trỏ tới tree đó
  const newCommit = await githubFetch(`/repos/${owner}/${repo}/git/commits`, {
    method: "POST",
    body: JSON.stringify({
      message: `Bai nop moi: ${submissionId}`,
      tree: newTree.sha,
      parents: [latestCommitSha],
    }),
  });

  // 6. Cập nhật nhánh main để trỏ tới commit mới -> đây là bước thực sự
  //    kích hoạt GitHub Actions workflow (vì nó tương đương một lần "push").
  await githubFetch(`/repos/${owner}/${repo}/git/refs/heads/${branch}`, {
    method: "PATCH",
    body: JSON.stringify({ sha: newCommit.sha, force: false }),
  });

  return submissionId;
}

/**
 * Đọc submissions/{id}/result.json từ repo backend.
 * Trả về null nếu file chưa tồn tại (nghĩa là vẫn đang chấm điểm).
 */
export async function getResult(submissionId) {
  const { owner, repo, branch } = repoInfo();
  try {
    const data = await githubFetch(
      `/repos/${owner}/${repo}/contents/submissions/${submissionId}/result.json?ref=${branch}`
    );
    const content = Buffer.from(data.content, "base64").toString("utf-8");
    return JSON.parse(content);
  } catch (err) {
    if (err.status === 404) return null;
    throw err;
  }
}
