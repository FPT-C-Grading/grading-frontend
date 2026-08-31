// Danh sách đề bài hợp lệ. Mỗi "id" PHẢI khớp đúng tên thư mục trong
// tests/{id}/ của repo backend (grading-engine).
//
// "language" PHẢI khớp đúng với "language" khai báo trong
// tests/{id}/config.json ở repo backend - nếu lệch nhau, sinh viên sẽ nộp
// nhầm loại file (main.c / main.cpp) và bị báo lỗi biên dịch.
//   - "c"   -> sinh viên nộp file .c, biên dịch bằng gcc
//   - "cpp" -> sinh viên nộp file .cpp, biên dịch bằng g++
//
// Khi thêm đề bài mới:
//   1. Tạo thư mục tests/{id}/ trong repo grading-engine với các cặp file
//      N.in / N.out và config.json (xem README của repo backend).
//   2. Thêm một dòng vào mảng bên dưới với đúng "language".
export const PROBLEMS = [
  // --- PART 1: BASICS & CONDITIONALS (001 - 010) ---
  { id: "001_sum_two_numbers", label: "001. Sum of two numbers (C)", language: "c" },
  { id: "001_sum_two_numbers_cpp", label: "001. Sum of two numbers (C++)", language: "cpp" },
  { id: "002_cal_two_numbers", label: "002. Calculate two numbers (C)", language: "c" },
  { id: "002_cal_two_numbers_cpp", label: "002. Calculate two numbers (C++)", language: "cpp" },
  { id: "003_cuuchuong", label: "003. Multiplication table (C)", language: "c" },
  { id: "003_cuuchuong_cpp", label: "003. Multiplication table (C++)", language: "cpp" },
  { id: "004_findmax", label: "004. Find maximum value (C)", language: "c" },
  { id: "004_findmax_cpp", label: "004. Find maximum value (C++)", language: "cpp" },
  { id: "005_check_sign", label: "005. Check positive, negative, or zero (C)", language: "c" },
  { id: "005_check_sign_cpp", label: "005. Check positive, negative, or zero (C++)", language: "cpp" },
  { id: "006_even_odd", label: "006. Even or odd number (C)", language: "c" },
  { id: "006_even_odd_cpp", label: "006. Even or odd number (C++)", language: "cpp" },
  { id: "007_score_pass_fail", label: "007. Score pass or fail (C)", language: "c" },
  { id: "007_score_pass_fail_cpp", label: "007. Score pass or fail (C++)", language: "cpp" },
  { id: "008_score_classification", label: "008. Score classification (C)", language: "c" },
  { id: "008_score_classification_cpp", label: "008. Score classification (C++)", language: "cpp" },
  { id: "009_leap_year", label: "009. Leap year check (C)", language: "c" },
  { id: "009_leap_year_cpp", label: "009. Leap year check (C++)", language: "cpp" },
  { id: "010_university_admission", label: "010. University admission eligibility (C)", language: "c" },
  { id: "010_university_admission_cpp", label: "010. University admission eligibility (C++)", language: "cpp" },

  // --- PART 2: SWITCH-CASE & MENU-DRIVEN (011 - 018) ---
  { id: "011_day_of_week", label: "011. Day of the week (C)", language: "c" },
  { id: "011_day_of_week_cpp", label: "011. Day of the week (C++)", language: "cpp" },
  { id: "012_simple_calculator", label: "012. Simple calculator (C)", language: "c" },
  { id: "012_simple_calculator_cpp", label: "012. Simple calculator (C++)", language: "cpp" },
  { id: "013_month_info", label: "013. Month information (C)", language: "c" },
  { id: "013_month_info_cpp", label: "013. Month information (C++)", language: "cpp" },
  { id: "014_traffic_light", label: "014. Traffic light controller (C)", language: "c" },
  { id: "014_traffic_light_cpp", label: "014. Traffic light controller (C++)", language: "cpp" },
  { id: "015_unit_converter", label: "015. Menu unit converter (C)", language: "c" },
  { id: "015_unit_converter_cpp", label: "015. Menu unit converter (C++)", language: "cpp" },
  { id: "016_atm_menu", label: "016. ATM menu simulation (C)", language: "c" },
  { id: "016_atm_menu_cpp", label: "016. ATM menu simulation (C++)", language: "cpp" },
  { id: "017_coffee_shop", label: "017. Coffee shop order (C)", language: "c" },
  { id: "017_coffee_shop_cpp", label: "017. Coffee shop order (C++)", language: "cpp" },
  { id: "018_mobile_plan", label: "018. Mobile phone plan (C)", language: "c" },
  { id: "018_mobile_plan_cpp", label: "018. Mobile phone plan (C++)", language: "cpp" },
];
