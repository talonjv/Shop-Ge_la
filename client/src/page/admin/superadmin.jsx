import { useEffect, useState } from "react";

const Superadmin = () => {
  const [admins, setAdmins] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // State cho modal xem chi tiết nhân viên
  const [detailAdmin, setDetailAdmin] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  // State cho form thêm/sửa (modal)
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(false);

  // Dữ liệu form
  const [formData, setFormData] = useState({
    AdminID: "",
    FullName: "",
    Email: "",
    Phone: "",
    PasswordHash: "",
    ProfilePicture: null,
    CreatedAt: "",
  });

  // Lấy danh sách admin từ API
  const fetchAdmins = async () => {
    try {
      const res = await fetch("http://localhost:2000/api/v1/admins");
      const data = await res.json();
      setAdmins(data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách admins:", error);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  // Xử lý đăng xuất
  const handleLogout = async () => {
    try {
      const res = await fetch("http://localhost:2000/api/v1/logout", {
        method: "POST",
        // Nếu cần gửi cookie
        credentials: "include",
      });
      if (res.ok) {
        // Ví dụ: chuyển hướng về trang login hoặc reload trang
        window.location.href = "/signin"; // hoặc window.location.reload();
      } else {
        console.error("Đăng xuất không thành công");
      }
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error);
    }
  };

  // Khi nhấn nút "Thêm nhân viên"
  const handleAddClick = () => {
    setEditing(false);
    setFormData({
      AdminID: "",
      FullName: "",
      Email: "",
      Phone: "",
      PasswordHash: "",
      ProfilePicture: null,
      CreatedAt: "",
    });
    setShowForm(true);
  };

  // Khi nhấn nút "Sửa"
  const handleEdit = (admin) => {
    setEditing(true);
    setFormData({
      AdminID: admin.AdminID,
      FullName: admin.FullName || "",
      Email: admin.Email || "",
      Phone: admin.Phone || "",
      PasswordHash: admin.PasswordHash || "",
      ProfilePicture: null,
      CreatedAt: admin.CreatedAt || "",
    });
    setShowForm(true);
  };

  // Khi nhấn nút "Xóa"
  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa?")) {
      try {
        await fetch(`http://localhost:2000/api/v1/admins/${id}`, {
          method: "DELETE",
        });
        fetchAdmins();
      } catch (error) {
        console.error("Lỗi khi xóa admin:", error);
      }
    }
  };

  // Xử lý thay đổi form
  const handleChange = (e) => {
    if (e.target.name === "ProfilePicture") {
      setFormData({ ...formData, ProfilePicture: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  // Submit form (thêm hoặc sửa)
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const fd = new FormData();
      fd.append("FullName", formData.FullName);
      fd.append("Email", formData.Email);
      fd.append("Phone", formData.Phone);
      fd.append("PasswordHash", formData.PasswordHash);
      // Khi tạo nhân viên, tự động set AccessLevel và Role
      fd.append("AccessLevel", "Limited Access");
      fd.append("Role", "Moderator");

      if (formData.ProfilePicture) {
        fd.append("ProfilePicture", formData.ProfilePicture);
      }

      if (!editing) {
        // Tạo mới
        await fetch("http://localhost:2000/api/v1/admins", {
          method: "POST",
          body: fd,
        });
      } else {
        // Cập nhật
        await fetch(`http://localhost:2000/api/v1/admins/${formData.AdminID}`, {
          method: "PUT",
          body: fd,
        });
      }

      fetchAdmins();
      setShowForm(false);
      setFormData({
        AdminID: "",
        FullName: "",
        Email: "",
        Phone: "",
        PasswordHash: "",
        ProfilePicture: null,
        CreatedAt: "",
      });
      setEditing(false);
    } catch (error) {
      console.error("Lỗi khi thêm/sửa admin:", error);
    }
  };

  // Đóng form khi bấm "Hủy"
  const handleCancel = () => {
    setShowForm(false);
    setEditing(false);
    setFormData({
      AdminID: "",
      FullName: "",
      Email: "",
      Phone: "",
      PasswordHash: "",
      ProfilePicture: null,
      CreatedAt: "",
    });
  };

  // Hàm mở modal xem chi tiết
  const handleViewDetails = (admin) => {
    setDetailAdmin(admin);
    setShowDetail(true);
  };

  // Đóng modal xem chi tiết
  const handleCloseDetail = () => {
    setShowDetail(false);
    setDetailAdmin(null);
  };

  // Lọc danh sách admins theo tên hoặc số điện thoại
  const filteredAdmins = admins.filter((admin) => {
    const lowerSearch = searchTerm.toLowerCase();
    return (
      (admin.FullName && admin.FullName.toLowerCase().includes(lowerSearch)) ||
      (admin.Phone && admin.Phone.toLowerCase().includes(lowerSearch))
    );
  });

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto bg-white shadow-xl rounded-lg p-6">
        <h1 className="text-3xl font-bold text-center mb-6">Quản lý Admins</h1>

        {/* Thanh tìm kiếm và nút Thêm nhân viên, Đăng xuất */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc số điện thoại..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-1/2 border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
          />
          <div className="flex gap-4">
            <button
              onClick={handleAddClick}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg transition"
            >
              Thêm nhân viên
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-lg transition"
            >
              Đăng xuất
            </button>
          </div>
        </div>

        {/* Bảng hiển thị admins */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border divide-y divide-gray-200">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-lg font-semibold text-gray-700">
                  Ảnh đại diện
                </th>
                <th className="px-6 py-4 text-left text-lg font-semibold text-gray-700">
                  Tên
                </th>
                <th className="px-6 py-4 text-left text-lg font-semibold text-gray-700">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-lg font-semibold text-gray-700">
                  SĐT
                </th>
                <th className="px-6 py-4 text-center text-lg font-semibold text-gray-700">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAdmins.map((admin) => (
                <tr key={admin.AdminID} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    {admin.ProfilePicture ? (
                      <img
                        src={`http://localhost:2000/image/${admin.ProfilePicture}`}
                        alt="avatar"
                        className="w-16 h-16 object-cover rounded-full"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center text-sm">
                        No Image
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-lg text-gray-800">
                    {admin.FullName}
                  </td>
                  <td className="px-6 py-4 text-lg text-gray-800">
                    {admin.Email}
                  </td>
                  <td className="px-6 py-4 text-lg text-gray-800">
                    {admin.Phone}
                  </td>
                  <td className="px-6 py-4 text-center space-x-3">
                    <button
                      onClick={() => handleViewDetails(admin)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg transition text-lg"
                    >
                      Xem chi tiết
                    </button>
                    <button
                      onClick={() => handleEdit(admin)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-2 rounded-lg transition text-lg"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(admin.AdminID)}
                      className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg transition text-lg"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal xem chi tiết nhân viên */}
      {showDetail && detailAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-lg relative shadow-2xl">
            <button
              onClick={handleCloseDetail}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-4">Chi tiết nhân viên</h2>
            <div className="space-y-4 text-lg">
              <p>
                <span className="font-semibold">AdminID:</span>{" "}
                {detailAdmin.AdminID}
              </p>
              <p>
                <span className="font-semibold">Họ Tên:</span>{" "}
                {detailAdmin.FullName}
              </p>
              <p>
                <span className="font-semibold">Email:</span> {detailAdmin.Email}
              </p>
              <p>
                <span className="font-semibold">Số điện thoại:</span>{" "}
                {detailAdmin.Phone}
              </p>
              <p>
                <span className="font-semibold">Mật khẩu:</span>{" "}
                {detailAdmin.PasswordHash}
              </p>
              <p>
                <span className="font-semibold">AccessLevel:</span>{" "}
                Limited Access
              </p>
              <p>
                <span className="font-semibold">Role:</span> Moderator
              </p>
              {detailAdmin.ProfilePicture && (
                <div>
                  <span className="font-semibold">Ảnh đại diện:</span>
                  <img
                    src={`http://localhost:2000/image/${detailAdmin.ProfilePicture}`}
                    alt="Avatar"
                    className="w-24 h-24 object-cover rounded-full mt-2"
                  />
                </div>
              )}
              <p>
                <span className="font-semibold">Ngày tạo:</span>{" "}
                {detailAdmin.CreatedAt
                  ? new Date(detailAdmin.CreatedAt).toLocaleString()
                  : ""}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal form thêm/sửa nhân viên */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
              onClick={handleCancel}
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-6 text-center">
              {editing ? "Sửa nhân viên" : "Thêm nhân viên"}
            </h2>
            <form onSubmit={handleSubmit}>
              {/* FullName */}
              <div className="mb-4">
                <label className="block mb-1 font-medium">Họ Tên</label>
                <input
                  type="text"
                  name="FullName"
                  value={formData.FullName}
                  onChange={handleChange}
                  required
                  className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {/* Email */}
              <div className="mb-4">
                <label className="block mb-1 font-medium">Email</label>
                <input
                  type="email"
                  name="Email"
                  value={formData.Email}
                  onChange={handleChange}
                  required
                  className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {/* Phone */}
              <div className="mb-4">
                <label className="block mb-1 font-medium">Số điện thoại</label>
                <input
                  type="text"
                  name="Phone"
                  value={formData.Phone}
                  onChange={handleChange}
                  className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {/* PasswordHash */}
              <div className="mb-4">
                <label className="block mb-1 font-medium">Mật khẩu</label>
                <input
                  type="text"
                  name="PasswordHash"
                  value={formData.PasswordHash}
                  onChange={handleChange}
                  className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {/* Không hiển thị trường AccessLevel và Role */}
              {/* ProfilePicture */}
              <div className="mb-4">
                <label className="block mb-1 font-medium">Ảnh đại diện</label>
                <input
                  type="file"
                  name="ProfilePicture"
                  onChange={handleChange}
                  className="w-full"
                />
              </div>
              {/* Nếu chế độ sửa, hiển thị Ngày tạo */}
              {editing && (
                <div className="mb-4">
                  <label className="block mb-1 font-medium">Ngày tạo</label>
                  <input
                    type="text"
                    name="CreatedAt"
                    value={formData.CreatedAt}
                    onChange={handleChange}
                    disabled
                    className="w-full border p-2 rounded bg-gray-100 cursor-not-allowed"
                  />
                </div>
              )}
              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg transition"
                  onClick={handleCancel}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition"
                >
                  {editing ? "Lưu thay đổi" : "Thêm mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Superadmin;






