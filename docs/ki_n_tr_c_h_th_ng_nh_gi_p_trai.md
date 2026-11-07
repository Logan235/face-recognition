# 📐 KIẾN TRÚC HỆ THỐNG: FACE RECOGNITION - HANDSOME RATING WEB

Dự án được chuyển đổi từ hệ thống "Điểm danh" sang "Giải trí / Đánh giá độ đẹp trai" dựa trên khuôn mặt chuẩn (Khuôn mặt của bạn).

## 1. Cấu trúc Database Mới (MongoDB)
Cần cập nhật các Schema trong NestJS Backend:

*   **`User` Schema (Cập nhật)**:
    *   `name`, `studentId` (giữ nguyên)
    *   `faceEncoding`: `[number]` (giữ nguyên, vector 128D)
    *   🆕 `handsomeScore`: `number` (Điểm số do Gemini đánh giá, lưu lúc đăng ký)
    *   🆕 `aiComment`: `string` (Nhận xét của Gemini, lưu lúc đăng ký)

*   **`Rating` Schema (Thay thế `Attendance`)**:
    *   `userId`: Reference tới User
    *   `name`, `studentId`: Thông tin người dùng
    *   `timestamp`: Thời gian quét
    *   `status`: 'Success'
    *   *Mục đích: Lưu lịch sử những lần người dùng quét mặt thành công để làm dữ liệu thống kê nếu cần.*

## 2. Luồng Nghiệp vụ (Business Flow)

### 🔄 Luồng 1: Đăng ký & Chấm điểm (Registration Flow)
Đây là luồng quan trọng nhất, tích hợp AI để đánh giá 1 lần duy nhất.
1. **Frontend**: Người dùng nhập tên, MSSV, chụp ảnh và gửi API `POST /api/users/register`.
2. **Backend (NestJS)**:
    *   **Bước 2.1**: Gửi ảnh sang **Python AI Service** để lấy vector đặc trưng 128D (phục vụ nhận diện sau này).
    *   **Bước 2.2**: Đọc file ảnh "chuẩn mực" của bạn (được hardcode sẵn ở thư mục backend, ví dụ `src/assets/standard_face.jpg`).
    *   **Bước 2.3**: Gửi *Ảnh của user* + *Ảnh chuẩn mực* lên **Gemini Vision API** với Prompt yêu cầu so sánh độ giống nhau, độ đẹp trai, và trả về định dạng JSON gồm `{ score, comment }`.
    *   **Bước 2.4**: Lưu tất cả (`name`, `studentId`, `faceEncoding`, `handsomeScore`, `aiComment`) vào collection `User`.
3. **Frontend**: Nhận thông báo đăng ký thành công.

### 🔄 Luồng 2: Đăng nhập & Hiển thị kết quả (Login/Scan Flow)
Luồng này cần cực kỳ nhanh chóng.
1. **Frontend**: Gửi frame ảnh liên tục từ webcam lên `POST /api/scan/recognize`.
2. **Backend (NestJS)**: 
    *   Gửi frame sang Python AI lấy vector -> So sánh vector với DB.
    *   Tìm thấy `User` khớp -> Ghi log vào collection `Rating`.
    *   Trả về thông tin `User` (bao gồm `handsomeScore` và `aiComment`).
3. **Frontend**:
    *   Dừng gửi frame.
    *   Bắn hiệu ứng pháo hoa / vỗ tay (sử dụng thư viện như `canvas-confetti`).
    *   Hiển thị **Popup Modal** hoành tráng chứa Điểm số, Lời nhận xét và Tên người dùng.

### 🔄 Luồng 3: Leaderboard (Bảng xếp hạng)
1. **Frontend**: Chuyển sang Tab "Bảng xếp hạng". Gọi API `GET /api/users/leaderboard`.
2. **Backend**: Truy vấn DB collection `User`, sắp xếp `handsomeScore` theo thứ tự giảm dần, trả về top 10/20.
3. **Frontend**: Hiển thị danh sách UI đẹp mắt.