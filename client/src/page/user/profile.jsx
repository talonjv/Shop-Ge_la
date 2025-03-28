  import { useState, useEffect } from "react";
  import { useSelector, useDispatch } from "react-redux";
  import axios from "axios";
  import Navbar from "../../layout/navbar";
  import { setUser } from "../../middleware/userSlice";
  import { useNavigate } from "react-router-dom";
  export default function Profile() {
    const customerId = useSelector((state) => state.user.user.customerId); // Lấy customerId từ Redux
  const dispatch = useDispatch();
    const user = useSelector((state) => state.user.user)
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [gender, setGender] = useState("male");
    const [avatar, setAvatar] = useState("default.jpg");
    const [address, setAddress] = useState("");
    const [district, setDistrict] = useState("");
  useEffect(() => {
      const storedUser = JSON.parse(localStorage.getItem("userData"));
      if (storedUser && storedUser.customerId) {
        dispatch(setUser(storedUser));
      }
    }, [dispatch]);

  useEffect(() => {
    if (!user.customerId) return; // Chờ Redux có customerId

    axios.get(`http://localhost:2000/api/v1/customer/${user.customerId}`)
      .then((response) => {
        console.log("📩 Dữ liệu từ API:", response.data);

        const userData = {
          customerId: user.customerId,
          name: response.data.FullName || "",
          email: response.data.Email || "",
          phone: response.data.Phone || "",
          gender: response.data.Gender || "male",
          address: response.data.Address || "",
          district: response.data.District || "",
          avatar: response.data.ProfilePicture || "default.jpg",
        };

        dispatch(setUser(userData));
        localStorage.setItem("userData", JSON.stringify(userData));

        // Cập nhật state component
        setName(userData.name);
        setEmail(userData.email);
        setPhone(userData.phone);
        setGender(userData.gender);
        setAddress(userData.address);
        setDistrict(userData.district);
        setAvatar(userData.avatar);
      })
      .catch((error) => console.error("❌ Lỗi lấy dữ liệu:", error));
  }, [dispatch, user.customerId]);

    const handleSave = () => {
      if (!customerId) {
        alert("Không tìm thấy ID khách hàng!");
        return;
      }
      const updatedData = {
        FullName: name,
        Email: email,
        Phone: phone,
        Gender: gender,
        Address: address,
        District: district,
      };
      axios.put(`http://localhost:2000/api/v1/change-customer/${customerId}`, updatedData)
        .then((response) => {
          alert(response.data.message);
          console.log("✅ Cập nhật thành công:", response.data);
        })
        .catch((err) => {
          console.error("❌ Lỗi khi cập nhật:", err);
          alert(err.response?.data?.message || "Lỗi khi cập nhật!");
        });
    };

    const handleAvatarChange = (e) => {
      if (!customerId) {
        alert("Không tìm thấy ID khách hàng!");
        return;
      }

      const file = e.target.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("avatar", file);

      axios.post(`http://localhost:2000/api/v1/change-avatar/${customerId}/avatar`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((response) => {
        const newAvatar = `http://localhost:2000/image/${response.data.fileName}`;
        setAvatar(newAvatar); // Cập nhật ngay avatar mới
        alert("✅ Ảnh đại diện cập nhật thành công!")
      })
      .catch((err) => {
        console.error("❌ Lỗi upload ảnh:", err);
        alert("Lỗi khi cập nhật ảnh đại diện!");
      });
    };
    const navigate = useNavigate();
    return (
      <>
        <Navbar />
        <div className="flex min-h-screen bg-gray-100 w-[70%] mx-auto">
          <aside className="w-1/4 bg-white p-6 shadow-md">
          <button onClick={() => navigate(-1)}
      className="flex mb-4 h-12 w-24 items-center justify-center bg-white border-none rounded-md tracking-wide transition-all duration-200 ease-linear shadow-md hover:shadow-xl hover:-translate-y-0.5">
  <svg className="mr-2 ml-2 w-5 h-5 transition-all duration-400 ease-in hover:-translate-x-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" fill="currentColor">
    <path d="M874.690416 495.52477c0 11.2973-9.168824 20.466124-20.466124 20.466124l-604.773963 0 188.083679 188.083679c7.992021 7.992021 7.992021 20.947078 0 28.939099-4.001127 3.990894-9.240455 5.996574-14.46955 5.996574-5.239328 0-10.478655-1.995447-14.479783-5.996574l-223.00912-223.00912c-3.837398-3.837398-5.996574-9.046027-5.996574-14.46955 0-5.433756 2.159176-10.632151 5.996574-14.46955l223.019353-223.029586c7.992021-7.992021 20.957311-7.992021 28.949332 0 7.992021 8.002254 7.992021 20.957311 0 28.949332l-188.073446 188.073446 604.753497 0C865.521592 475.058646 874.690416 484.217237 874.690416 495.52477z"></path>
  </svg>
  <span>Back</span>
</button>
            <h2 className="text-lg font-bold mb-4">Tài Khoản Của Tôi</h2>
            <ul className="space-y-3 text-gray-600">
              <li className="font-semibold text-orange-500">Hồ Sơ</li>
              <li className="cursor-pointer" onClick={() => navigate("/don-hang")}>Đơn hàng</li>
              <li className="cursor-pointer" onClick={() => navigate("/cart")}>Giỏ hàng</li>
              <li className="cursor-pointer" onClick={() => navigate("/dia-chi")}>Địa Chỉ</li>
            </ul>
          </aside>

          <main className="flex-1 p-6 bg-white shadow-md w-[70%]">
            <h1 className="text-xl font-bold mb-4">Hồ Sơ Của Tôi</h1>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block font-medium text-gray-700">Tên</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
              </div>

              <div>
                <label className="block font-medium text-gray-700">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
              </div>

              <div>
                <label className="block font-medium text-gray-700">Số điện thoại</label>
                <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
              </div>

              <div>
                <label className="block font-medium text-gray-700">Giới tính</label>
                <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full px-3 py-2 border rounded-lg">
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                  <option value="other">Khác</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-gray-700">Địa chỉ</label>
                <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
              </div>

              <div>
                <label className="block font-medium text-gray-700">Quận/Huyện</label>
                <input type="text" value={district} onChange={(e) => setDistrict(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
              </div>

              {/* Avatar */}
              <div className="col-span-2 flex flex-col items-center">
                <div className="relative w-28 h-28 border rounded-full overflow-hidden mb-3">
                  <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                </div>
                <input type="file" onChange={handleAvatarChange} className="hidden" id="fileInput" />
                <label htmlFor="fileInput" className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                  Chọn Ảnh
                </label>
              </div>
            </div>

            {/* Save Button */}
            <button onClick={handleSave} className="w-full bg-orange-500 text-white px-4 py-2 rounded-lg mt-6 hover:bg-orange-600">
              Lưu
            </button>
          </main>
        </div>
      </>
    );
  }



