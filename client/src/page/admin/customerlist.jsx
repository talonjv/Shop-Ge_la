import { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [editCustomer, setEditCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const customersPerPage = 15;

  // Lấy dữ liệu khách hàng từ API
  const fetchCustomers = async () => {
    try {
      const response = await axios.get("http://localhost:2000/api/v1/customers");
      setCustomers(response.data.data);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu khách hàng:", error);
      toast.error("Lỗi khi lấy dữ liệu khách hàng!");
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Xử lý khi bấm nút Sửa
  const handleEditClick = (customer) => {
    setEditCustomer(customer);
  };

  // Cập nhật dữ liệu khi thay đổi input trong modal
  const handleChangeEdit = (e) => {
    const { name, value } = e.target;
    setEditCustomer({
      ...editCustomer,
      [name]: value,
    });
  };

  // Xử lý file upload khi chọn ảnh mới
  const handleFileChange = (e) => {
    setEditCustomer({
      ...editCustomer,
      ProfilePicture: e.target.files[0],
    });
  };

  // Lưu cập nhật khách hàng
  const handleSave = async (e) => {
    e.preventDefault();
    if (!editCustomer) return;
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("FullName", editCustomer.FullName);
      formData.append("Email", editCustomer.Email);
      formData.append("Phone", editCustomer.Phone);
      formData.append("PasswordHash", editCustomer.PasswordHash);
      formData.append("Gender", editCustomer.Gender);
      formData.append("Address", editCustomer.Address);
      formData.append("District", editCustomer.District);
      formData.append("City", editCustomer.City);
      formData.append("ZipCode", editCustomer.ZipCode || "");

      if (editCustomer.ProfilePicture instanceof File) {
        formData.append("ProfilePicture", editCustomer.ProfilePicture);
      }

      const response = await axios.put(
        `http://localhost:2000/api/v1/update-customer/${editCustomer.CustomerID}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (response.status === 200) {
        toast.success("Cập nhật thành công!");
        // Tự động cập nhật lại dữ liệu sau khi lưu thành công
        await fetchCustomers();
        setEditCustomer(null);
      } else {
        throw new Error("Cập nhật không thành công từ server");
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật:", error);
      toast.error("Cập nhật thất bại!");
    } finally {
      setIsLoading(false);
    }
  };

  // Hủy chỉnh sửa và đóng modal
  const handleCancel = () => {
    setEditCustomer(null);
  };

  // Xử lý xóa khách hàng
  const handleDelete = async (customerId) => {
    if (!window.confirm("Bạn có chắc muốn xóa khách hàng này?")) return;
    try {
      await axios.delete(`http://localhost:2000/api/v1/delete-customer/${customerId}`);
      toast.success("Xóa thành công!");
      await fetchCustomers();
    } catch (error) {
      console.error("Lỗi khi xóa:", error);
      toast.error("Xóa thất bại!");
    }
  };

  // Lọc khách hàng theo từ khóa (theo tên và số điện thoại)
  const filteredCustomers = customers.filter((customer) => {
    const lowerSearch = searchTerm.toLowerCase();
    return (
      (customer.FullName && customer.FullName.toLowerCase().includes(lowerSearch)) ||
      (customer.Phone && customer.Phone.toLowerCase().includes(lowerSearch))
    );
  });

  // Phân trang
  const totalPages = Math.ceil(filteredCustomers.length / customersPerPage);
  const indexOfLastCustomer = currentPage * customersPerPage;
  const indexOfFirstCustomer = indexOfLastCustomer - customersPerPage;
  const currentCustomers = filteredCustomers.slice(indexOfFirstCustomer, indexOfLastCustomer);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <ToastContainer />
      <div className="max-w-6xl mx-auto bg-white shadow-xl rounded-lg p-6">
        <h1 className="text-3xl font-bold text-center mb-6">Danh sách Khách hàng</h1>
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <input
            type="text"
            placeholder="Tìm kiếm khách hàng (Tên hoặc SĐT)..."
            className="border p-3 rounded-lg w-full sm:w-1/2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
          <button className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition">
            Thêm khách hàng
          </button>
        </div>

        {/* Bảng danh sách khách hàng */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border divide-y divide-gray-200">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Ảnh</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Họ & Tên</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">SĐT</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Giới tính</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Địa chỉ</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentCustomers.map((customer) => (
                <tr key={customer.CustomerID}>
                  <td className="px-4 py-3">
                    {customer.ProfilePicture ? (
                      <img
                        src={`http://localhost:2000/image/${customer.ProfilePicture}`}
                        alt="Profile"
                        className="w-12 h-12 object-cover rounded-full"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-xs">
                        No Image
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-800">{customer.FullName}</td>
                  <td className="px-4 py-3 text-sm text-gray-800">{customer.Email}</td>
                  <td className="px-4 py-3 text-sm text-gray-800">{customer.Phone}</td>
                  <td className="px-4 py-3 text-sm text-gray-800">{customer.Gender}</td>
                  <td className="px-4 py-3 text-sm text-gray-800">
                    {customer.Address}, {customer.District}, {customer.City}
                  </td>
                  <td className="px-4 py-3 text-center space-x-2">
                    <button
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition"
                      onClick={() => handleEditClick(customer)}
                    >
                      Sửa
                    </button>
                    <button
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
                      onClick={() => handleDelete(customer.CustomerID)}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Phân trang */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center space-x-3">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-4 py-2 rounded-lg border transition ${
                  currentPage === i + 1
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Modal chỉnh sửa khách hàng */}
      {editCustomer && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
              onClick={handleCancel}
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-6 text-center">Sửa thông tin khách hàng</h2>
            <form onSubmit={handleSave}>
              <div className="flex items-center mb-4">
                <label className="w-1/3 text-gray-700">Họ và Tên</label>
                <input
                  type="text"
                  name="FullName"
                  value={editCustomer.FullName || ""}
                  onChange={handleChangeEdit}
                  className="w-2/3 border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Họ và Tên"
                />
              </div>
              <div className="flex items-center mb-4">
                <label className="w-1/3 text-gray-700">Email</label>
                <input
                  type="text"
                  name="Email"
                  value={editCustomer.Email || ""}
                  onChange={handleChangeEdit}
                  className="w-2/3 border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Email"
                />
              </div>
              <div className="flex items-center mb-4">
                <label className="w-1/3 text-gray-700">SĐT</label>
                <input
                  type="text"
                  name="Phone"
                  value={editCustomer.Phone || ""}
                  onChange={handleChangeEdit}
                  className="w-2/3 border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Số điện thoại"
                />
              </div>
              <div className="flex items-center mb-4">
                <label className="w-1/3 text-gray-700">Giới tính</label>
                <select
                  name="Gender"
                  value={editCustomer.Gender || ""}
                  onChange={handleChangeEdit}
                  className="w-2/3 border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Chọn giới tính</option>
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>
              <div className="flex items-center mb-4">
                <label className="w-1/3 text-gray-700">Mật khẩu</label>
                <input
                  type="text"
                  name="PasswordHash"
                  value={editCustomer.PasswordHash || ""}
                  onChange={handleChangeEdit}
                  className="w-2/3 border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Mật khẩu"
                />
              </div>
              <div className="flex items-center mb-4">
                <label className="w-1/3 text-gray-700">Địa chỉ</label>
                <input
                  type="text"
                  name="Address"
                  value={editCustomer.Address || ""}
                  onChange={handleChangeEdit}
                  className="w-2/3 border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Địa chỉ"
                />
              </div>
              <div className="flex items-center mb-4">
                <label className="w-1/3 text-gray-700">Quận/Huyện</label>
                <input
                  type="text"
                  name="District"
                  value={editCustomer.District || ""}
                  onChange={handleChangeEdit}
                  className="w-2/3 border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Quận/Huyện"
                />
              </div>
              <div className="flex items-center mb-4">
                <label className="w-1/3 text-gray-700">Thành phố</label>
                <input
                  type="text"
                  name="City"
                  value={editCustomer.City || ""}
                  onChange={handleChangeEdit}
                  className="w-2/3 border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Thành phố"
                />
              </div>
              <div className="flex items-center mb-4">
                <label className="w-1/3 text-gray-700">ZipCode</label>
                <input
                  type="text"
                  name="ZipCode"
                  value={editCustomer.ZipCode || ""}
                  onChange={handleChangeEdit}
                  className="w-2/3 border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ZipCode"
                />
              </div>
              <div className="flex items-center mb-6">
                <label className="w-1/3 text-gray-700">Ảnh đại diện</label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="w-2/3 border p-2 rounded"
                />
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg transition"
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition"
                  disabled={isLoading}
                >
                  {isLoading ? "Đang lưu..." : "Lưu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerList;








