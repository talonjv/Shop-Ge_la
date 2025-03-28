import  { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import ds from "../../assets/lg-rg-bg.jpg";
const RegisterForm = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    gender: "Male",
  });

  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  // Giữ nguyên logic handleChange
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Giữ nguyên logic handleSubmit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fullName || !formData.email || !formData.phone) {
      setMessage({ type: "error", text: "Vui lòng nhập đầy đủ thông tin!" });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: "error", text: "Mật khẩu không khớp!" });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await axios.post("http://localhost:2000/api/v1/register", {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        gender: formData.gender,
        profilePicture: "images-1741003690904.jpg",
      });

      setMessage({ type: "success", text: "Đăng ký thành công!" });

      // Reset form sau khi đăng ký thành công
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        gender: "Male",
      });
    } catch (error) {
      console.error("Lỗi đăng ký:", error);
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Lỗi máy chủ. Vui lòng thử lại!",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Cột trái - bạn có thể thay ảnh, video, background tùy ý */}
      <div className="hidden md:flex w-1/3 bg-blue-600 items-center justify-center relative">
        <img src={ds} alt="LIAMI Model" className="object-cover w-full h-full" />
        <div className="absolute top-4 left-4 text-white text-3xl font-bold">Gela</div>
      </div>

      {/* Cột phải - form đăng ký */}
      <div className="flex flex-col w-full lg:w-2/3 justify-center items-center bg-white">
        <div className="max-w-md w-full px-8 py-10">
          {/* Phần trên: heading và link chuyển sang đăng nhập */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Sign up to GELA</h1>
            <Link
              to="/signin"
              className="text-sm text-blue-600 hover:text-blue-500 font-semibold"
            >
              Bạn đã có tài khoản rồi sao?
            </Link>
          </div>

          {/* Thông báo lỗi / thành công */}
          {message && (
            <p
              className={`mb-4 text-sm ${
                message.type === "error" ? "text-red-600" : "text-green-600"
              }`}
            >
              {message.text}
            </p>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
            {/* Giữ nguyên các input, chỉ đổi className cho đồng bộ */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Họ và Tên
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                placeholder="Nhập họ tên"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                placeholder="Nhập email"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Số điện thoại
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                placeholder="Nhập số điện thoại"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Giới tính
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
              >
                <option value="Male">Nam</option>
                <option value="Female">Nữ</option>
                <option value="Other">Khác</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Mật khẩu
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                placeholder="Nhập mật khẩu"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Nhập lại mật khẩu
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                placeholder="Xác nhận mật khẩu"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-2 bg-black text-white font-semibold rounded-md hover:bg-gray-800 focus:outline-none transition-colors duration-300"
            >
              {loading ? "Đang đăng ký..." : "Đăng ký"}
            </button>
          </form>

          {/* Có thể thêm nút/quảng cáo hoặc link dưới form nếu muốn */}
          {/* <div className="text-center mt-4">
            <Link
              to="/signin"
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              Đăng nhập
            </Link>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;



