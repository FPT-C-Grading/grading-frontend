# FPT University PRF192-grading-frontend

Giao diện web (Next.js) để sinh viên nộp mã nguồn C và xem kết quả chấm điểm
tự động. Backend chấm điểm nằm ở repo riêng: `FPT-C-Grading/grading-engine`.

## Cách hoạt động

1. Sinh viên dán code hoặc tải file `.c`, nhập mã số sinh viên, chọn đề bài.
2. Trang gọi API nội bộ `/api/submit` → API này dùng GitHub token (giữ bí
   mật ở phía máy chủ) để tạo 1 commit trong repo `grading-engine` chứa
   `submissions/{id}/main.c` và `submissions/{id}/meta.json`.
3. Commit đó tự kích hoạt GitHub Actions bên repo backend để chấm điểm.
4. Trang tự động hỏi lại `/api/status/{id}` mỗi 2.5 giây để lấy
   `submissions/{id}/result.json` khi đã có, rồi hiển thị điểm.

## Bước 1 — Tạo GitHub Token cho phép frontend ghi vào repo backend

1. Đăng nhập GitHub → **Settings** (ảnh đại diện góc phải trên) →
   **Developer settings** → **Personal access tokens** →
   **Fine-grained tokens** → **Generate new token**.
2. Đặt tên token, ví dụ `grading-frontend-token`.
3. **Resource owner**: chọn tổ chức `FPT-C-Grading`.
4. **Repository access**: chọn **Only select repositories** → chọn
   `grading-engine`.
5. **Permissions** → **Repository permissions** → mục **Contents**: chọn
   **Read and write**.
6. Bấm **Generate token**, **copy và lưu lại ngay** (GitHub chỉ hiện 1 lần).

## Bước 2 — Đưa code frontend này lên một repo GitHub mới

1. Tạo repo mới trong tổ chức `FPT-C-Grading`, ví dụ đặt tên
   `grading-frontend` (Private hoặc Public đều được, không chứa dữ liệu
   nhạy cảm — token KHÔNG nằm trong code).
2. Upload toàn bộ nội dung thư mục này lên repo đó (cách làm giống hệt
   như bạn đã làm với repo `grading-engine` — dùng "Add file → Upload
   files").

**Lưu ý:** đây là repo THỨ HAI, tách biệt với `grading-engine`. Repo
`grading-engine` chứa backend (workflow chấm điểm), repo này chỉ chứa
frontend.

## Bước 3 — Deploy lên Vercel

1. Vào https://vercel.com, đăng nhập (nên đăng nhập bằng tài khoản GitHub
   để liên kết sẵn).
2. Bấm **Add New → Project**.
3. Chọn repo `grading-frontend` bạn vừa tạo → bấm **Import**.
4. Ở bước cấu hình, mở phần **Environment Variables**, thêm 4 biến:

   | Name | Value |
   |---|---|
   | `GITHUB_TOKEN` | token đã tạo ở Bước 1 |
   | `GITHUB_OWNER` | `FPT-C-Grading` |
   | `GITHUB_REPO` | `grading-engine` |
   | `GITHUB_BRANCH` | `main` |

5. Bấm **Deploy**. Đợi khoảng 1–2 phút, Vercel sẽ cấp cho bạn một đường
   link dạng `https://grading-frontend-xxxx.vercel.app`.

## Bước 4 — Kiểm thử

1. Mở link Vercel vừa cấp.
2. Dán một đoạn code C đúng đề "Tính tổng hai số" (đọc 2 số nguyên, in
   tổng), nhập mã số sinh viên bất kỳ, bấm **Nộp bài chấm điểm**.
3. Trang sẽ hiện "Đang biên dịch và chấm điểm..." rồi tự cập nhật kết quả
   sau khoảng 15–60 giây.
4. Có thể vào tab **Actions** của repo `grading-engine` để xem workflow
   chạy song song lúc đó.

## Thêm đề bài mới

1. Thêm bộ test vào repo backend: `tests/{ten_de_bai}/` (xem README của
   repo `grading-engine`).
2. Mở file `lib/problems.js` trong repo frontend này, thêm một dòng:
   ```js
   { id: "ten_de_bai", label: "Đề X: Mô tả ngắn gọn" }
   ```
3. Commit thay đổi — Vercel sẽ tự động build lại và cập nhật trang trong
   khoảng 1 phút.

## Chạy thử ở máy cá nhân (tùy chọn, không bắt buộc)

Nếu máy bạn đã cài Node.js:

```
npm install
cp .env.local.example .env.local   # rồi điền giá trị thật vào .env.local
npm run dev
```

Mở http://localhost:3000.

## Giới hạn hiện tại

- Mã nguồn tối đa 20.000 ký tự mỗi lần nộp (chỉnh trong
  `app/api/submit/route.js`, biến `MAX_CODE_LENGTH`).
- Trang chờ tối đa 90 giây kết quả trước khi báo "đang xử lý lâu hơn dự
  kiến" (chỉnh trong `app/page.js`, biến `POLL_TIMEOUT_MS`) — bài nộp vẫn
  được chấm bình thường ở phía sau, chỉ là trang ngừng tự động hỏi lại.
- Không có xác thực đăng nhập — sinh viên tự nhập mã số sinh viên, phù hợp
  bối cảnh phòng thi có giám sát trực tiếp.
