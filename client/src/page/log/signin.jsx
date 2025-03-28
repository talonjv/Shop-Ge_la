import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setUser } from "../../middleware/userSlice";
// Đảm bảo cài: npm install jwt-decode
import { jwtDecode } from "jwt-decode";
import ds from "../../assets/lg-rg-bg.jpg";

const LoginForm = () => {
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Gọi API login
      const response = await axios.post(
        "http://localhost:2000/api/v1/login",
        { email, password },
        { withCredentials: true }
      );
      console.log("Login successful:", response.data);

      // Lấy token, user, message từ response
      const { token, user, message } = response.data;
      if (!token) {
        setError("Login failed: No token received!");
        return;
      }

      // Gán vào localStorage nếu cần
      localStorage.setItem("token", token);

      // Xử lý avatar
      // Nếu user.profilePicture chỉ là tên file, ta ghép URL
      const avatar = user.profilePicture
        ? `http://localhost:2000/image/${user.profilePicture}`
        : "default-avatar.jpg";

      // Tạo object userData để dispatch lên Redux
      const userData = {
        customerId: user.id || null,
        role: user.role || "Customer",
        name: user.fullName || "",
        avatar: avatar,
        email: user.email || email,
        phone: user.phone || "",
        gender: user.gender || "male",
        address: user.address || "",
        district: user.district || "",
      };
      dispatch(setUser(userData));

      // Chuyển hướng dựa trên role
      switch (userData.role) {
        case "SuperAdmin":
          navigate("/superadmin");
          break;
        case "Admin":
          navigate("/superadmin");
          break;
        case "Moderator":
          navigate("/admin");
          break;
        default:
          navigate("/");
          break;
      }

      alert(message || "Login successful!");
    } catch (err) {
      console.error("❌ Login error:", err);
      setError(err.response?.data?.message || "Login failed!");
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="flex min-h-screen">
      {/* Left Section - Image Background */}
      <div className="hidden md:flex w-1/3 bg-blue-600 items-center justify-center relative">
        <img src={ds} alt="LIAMI Model" className="object-cover w-full h-full" />
        <div className="absolute top-4 left-4 text-white text-3xl font-bold">Gela</div>
      </div>

      {/* Right Section - Login Form */}
      <div className="w-full md:w-2/3 flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-md">
          {/* Sign Up Link */}
          <div className="flex justify-end mb-4">
            <span className="text-gray-500 mr-2">Bạn chưa có tài khoản?</span>
            <Link
              to="/register"
              className="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 transition duration-300"
            >
              Đăng kí ngay
            </Link>
          </div>

          {/* Form Title */}
          <h1 className="text-3xl font-bold text-black mb-2">Sign in to LIAMI</h1>
          <p className="text-gray-500 mb-6"></p>

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="Email"
              className="p-3 border border-gray-300 rounded-lg text-black outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="p-3 border border-gray-300 rounded-lg text-black outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div className="ml-12">
              <button
                type="submit"
                className={`px-8 py-3 bg-black text-white rounded-full transition duration-300 ${
                  loading ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-800"
                }`}
                disabled={loading}
              >
                {loading ? "Đang đăng nhập..." : "Đăng nhập"}
              </button>
              <Link to="/forgot-password" className="text-gray-500 ml-[50px] hover:underline">
                Bạn bị quên mật khẩu?
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;













