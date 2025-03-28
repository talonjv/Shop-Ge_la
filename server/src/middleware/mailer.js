import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // Sử dụng TLS
  auth: {
    user: process.env.MAIL_USERNAME, // Tài khoản Gmail
    pass: process.env.MAIL_PASSWORD, // Mật khẩu ứng dụng (App Password)
  },
  tls: {
    rejectUnauthorized: false,
  },
});

/**
 * Hàm gửi email.
 * @param {string} to - Địa chỉ email người nhận.
 * @param {string} subject - Tiêu đề email.
 * @param {string} htmlContent - Nội dung email (định dạng HTML).
 */
export async function sendEmail(to, subject, htmlContent) {
  try {
    const info = await transporter.sendMail({
      from: process.env.MAIL_USERNAME, // Địa chỉ email người gửi
      to,
      subject,
      html: htmlContent,
    });
    console.log("Email đã được gửi:", info.messageId);
  } catch (error) {
    console.error("Lỗi khi gửi email:", error);
  }
}

// Xuất mặc định transporter nếu bạn muốn dùng trực tiếp
export default transporter;

