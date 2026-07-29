// Danh sách đề bài hợp lệ. Mỗi "id" PHẢI khớp đúng tên thư mục trong
// tests/{id}/ của repo backend (grading-engine).
//
// Khi thêm đề bài mới:
//   1. Tạo thư mục tests/{id}/ trong repo grading-engine với các cặp file
//      N.in / N.out (xem README của repo backend).
//   2. Thêm một dòng vào mảng bên dưới.
export const PROBLEMS = [
  { id: "sum_two_numbers", label: "Đề 1: Tính tổng hai số" },
];
