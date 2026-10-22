import { REPO_URL } from '@/config/constants'

/**
 * Shown once to first-time visitors (empty document, not in a ?room).
 * It doubles as a tour of the features, so everything below is editable.
 */
export const WELCOME_CONTENT = `
<h1>Chào mừng đến với Text Editor React 👋</h1>
<p><em>A Word-like rich text editor for the web, built with React and TipTap.</em></p>
<p>Đây là một trình soạn thảo văn bản giống Word / Google Docs chạy hoàn toàn trên trình duyệt: trang A4 thật, lề trang, bảng, công thức, ảnh, tự lưu và xuất PDF. Nội dung này chỉ để bạn thử — cứ sửa, xoá thoải mái.</p>

<h2>Thử nhanh trong 1 phút</h2>
<ul data-type="taskList">
  <li data-type="taskItem" data-checked="true"><p>Mở trang này lần đầu</p></li>
  <li data-type="taskItem" data-checked="false"><p><strong>Bôi đen</strong> một đoạn chữ để hiện thanh định dạng nhanh</p></li>
  <li data-type="taskItem" data-checked="false"><p>Gõ <code>:rocket:</code> để chèn emoji, hoặc bấm nút 😊 trên thanh công cụ</p></li>
  <li data-type="taskItem" data-checked="false"><p><strong>Chuột phải</strong> vào một ô trong bảng bên dưới để thêm hàng, gộp ô, tô màu nền</p></li>
  <li data-type="taskItem" data-checked="false"><p>Dán một ảnh chụp màn hình (Ctrl/Cmd + V), rồi bấm vào ảnh để cho chữ chạy quanh</p></li>
  <li data-type="taskItem" data-checked="false"><p>Bấm <strong>Xuất PDF</strong> và chọn “Save as PDF”</p></li>
</ul>

<h2>Có gì trong này?</h2>
<table>
  <tbody>
    <tr><th><p>Tính năng</p></th><th><p>Mô tả</p></th></tr>
    <tr><td><p>📄 Trang A4</p></td><td><p>Nội dung tự chia thành từng tờ giấy, bảng dài tự tách và lặp lại hàng tiêu đề</p></td></tr>
    <tr><td><p>🖼️ Ảnh</p></td><td><p>Dán, kéo thả, đổi kích thước, chữ bao quanh trái / phải</p></td></tr>
    <tr><td><p>📊 Bảng</p></td><td><p>Gộp / tách ô, màu nền, căn dọc, ẩn viền</p></td></tr>
    <tr><td><p>💾 Tự lưu</p></td><td><p>Tải lại trang vẫn còn nguyên nội dung (lưu trong trình duyệt)</p></td></tr>
    <tr><td><p>👥 Làm việc nhóm</p></td><td><p>Thêm <code>?room=ten-nhom</code> vào đường dẫn để cùng soạn thời gian thực</p></td></tr>
    <tr><td><p>🖨️ Xuất PDF</p></td><td><p>Giữ nguyên khổ giấy, lề, ngắt trang, có số trang ở chân trang</p></td></tr>
  </tbody>
</table>

<h2>Công thức và định dạng</h2>
<p>Công thức nổi tiếng nhất của Einstein: <span data-type="inline-math" data-latex="E = mc^2"></span>, hay nghiệm của phương trình bậc hai: <span data-type="inline-math" data-latex="x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}"></span>.</p>
<p>Chữ có thể <strong>đậm</strong>, <em>nghiêng</em>, <u>gạch chân</u>, <s>gạch ngang</s>, <mark data-color="#fef08a" style="background-color: #fef08a">tô sáng</mark>, hoặc <span style="color: #1a73e8">đổi màu</span>.</p>
<blockquote><p>Mẹo: dán nội dung từ Google Docs — tiêu đề, danh sách, checklist và bảng đều được giữ lại.</p></blockquote>

<h2>Phím tắt hay dùng</h2>
<ul>
  <li><p><code>Ctrl/Cmd + B / I / U</code> — đậm, nghiêng, gạch chân</p></li>
  <li><p><code>Ctrl/Cmd + Z</code> — hoàn tác, <code>Ctrl/Cmd + Shift + Z</code> — làm lại</p></li>
  <li><p>Gõ <code>#</code> + dấu cách ở đầu dòng để tạo tiêu đề, <code>-</code> + dấu cách để tạo danh sách</p></li>
</ul>

<p>Mã nguồn mở (MIT) trên GitHub: <a href="${REPO_URL}">${REPO_URL.replace('https://', '')}</a> — nếu thấy hữu ích, cho dự án một ⭐ nhé!</p>
`
