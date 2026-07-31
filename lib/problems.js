// Danh sách đề bài hợp lệ. Mỗi "id" PHẢI khớp đúng tên thư mục trong
// tests/{id}/ của repo backend (grading-engine).
//
// "language" PHẢI khớp đúng với "language" khai báo trong
// tests/{id}/config.json ở repo backend — nếu lệch nhau, sinh viên sẽ nộp
// nhầm loại file (main.c / main.cpp) và bị báo lỗi biên dịch.
//   - "c"   -> sinh viên nộp file .c, biên dịch bằng gcc
//   - "cpp" -> sinh viên nộp file .cpp, biên dịch bằng g++
//
// Khi thêm đề bài mới:
//   1. Tạo thư mục tests/{id}/ trong repo grading-engine với các cặp file
//      N.in / N.out và config.json (xem README của repo backend).
//   2. Thêm một dòng vào mảng bên dưới với đúng "language".
export const PROBLEMS = [
  { id: "sum_two_numbers", label: "Đề 1: Tính tổng hai số", language: "c" },
  { id: "sum_two_numbers", label: "Đề 1: Tính tổng hai số", language: "c" },
  { id: "sum_two_numbers_cpp", label: "Đề 3: Tính tổng 2 số (C++)", language: "cpp" },
];
