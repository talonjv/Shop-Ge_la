import { useState } from "react";
import axios from "axios";

export default function ForgetPassword() {
    const [step, setStep] = useState(1); // 1: Nhập email, 2: Nhập OTP
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    // 📌 Gửi yêu cầu OTP
    const handleSendOTP = async () => {
        setLoading(true);
        try {
            const res = await axios.post("http://localhost:2000/api/v1/send-otp", { email });

            // 📌 Lưu otpToken vào localStorage
            localStorage.setItem("otpToken", res.data.otpToken);
            
            setMessage(res.data.message);
            setStep(2); // Chuyển sang bước nhập OTP
        } catch (error) {
            setMessage(error.response?.data?.message || "Có lỗi xảy ra!");
        }
        setLoading(false);
    };

    // 📌 Xác minh OTP
    const handleVerifyOTP = async () => {
        setLoading(true);
        const otpToken = localStorage.getItem("otpToken"); // 📌 Lấy otpToken từ localStorage
        
        if (!otpToken) {
            setMessage("Lỗi: OTP Token đã hết hạn hoặc không tồn tại.");
            setLoading(false);
            return;
        }

        try {
            const res = await axios.post("http://localhost:2000/api/v1/reset-password", { email, otp, otpToken });

            setMessage(res.data.message);
            setStep(3); // Chuyển sang bước thông báo thành công
            
            localStorage.removeItem("otpToken"); // 📌 Xóa otpToken sau khi xác minh thành công
        } catch (error) {
            setMessage(error.response?.data?.message || "OTP không hợp lệ!");
        }
        setLoading(false);
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
            <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold text-center mb-4">Quên Mật Khẩu</h2>

                {message && <p className="text-center text-green-500 mb-4">{message}</p>}

                {step === 1 && (
                    <div>
                        <label className="block mb-2 text-sm font-medium">Nhập Email:</label>
                        <input
                            type="email"
                            className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-blue-200"
                            placeholder="Nhập email của bạn"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <button
                            className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg mt-4 hover:bg-blue-600"
                            onClick={handleSendOTP}
                            disabled={loading}
                        >
                            {loading ? "Đang gửi..." : "Gửi OTP"}
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div>
                        <label className="block mb-2 text-sm font-medium">Nhập OTP:</label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-blue-200"
                            placeholder="Nhập mã OTP"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                        />
                        <button
                            className="w-full bg-green-500 text-white px-4 py-2 rounded-lg mt-4 hover:bg-green-600"
                            onClick={handleVerifyOTP}
                            disabled={loading}
                        >
                            {loading ? "Đang xác minh..." : "Xác nhận OTP"}
                        </button>
                    </div>
                )}

                {step === 3 && (
                    <div className="text-center">
                        <p className="text-green-500 font-semibold">Mật khẩu mới đã được gửi đến email của bạn!</p>
                    </div>
                )}
            </div>
        </div>
    );
}



