import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import {  useNavigate } from "react-router";
import Navbar from "../../layout/navbar";
function AddressCustomer() {
  const customerId = useSelector((state) => state.user.user.customerId);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
  // State cho Tạo
  const [newAddress, setNewAddress] = useState({
    LocationName: "",
    Email: "",
    Phone: "",
    Address: "",
    Country: "",
  });

  // State cho Sửa
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    LocationName: "",
    Email: "",
    Phone: "",
    Address: "",
    Country: "",
  });

  // **NEW**: State quản lý việc hiển thị modal sửa
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Nếu chưa đăng nhập
  if (!customerId) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6 text-center">Quản lý Địa chỉ</h1>
        <p className="text-center text-red-500">
          Bạn cần đăng nhập để xem và quản lý địa chỉ.
        </p>
      </div>
    );
  }

  // Lấy danh sách địa chỉ
  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:2000/api/v1/address/${customerId}`
      );
      if (Array.isArray(response.data)) {
        setAddresses(response.data);
      } else {
        setAddresses([]);
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách địa chỉ:", error);
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
    // eslint-disable-next-line
  }, [customerId]);

  // Tạo địa chỉ
  const handleNewAddressChange = (e) => {
    const { name, value } = e.target;
    setNewAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateAddress = async (e) => {
    e.preventDefault();
    try {
      const dataToCreate = {
        CustomerID: customerId,
        ...newAddress,
      };
      const response = await axios.post(
        "http://localhost:2000/api/v1/address",
        dataToCreate
      );
      if (response.data.error) {
        alert(response.data.error);
      } else {
        alert("Tạo địa chỉ thành công!");
        setNewAddress({
          LocationName: "",
          Email: "",
          Phone: "",
          Address: "",
          Country: "",
        });
        fetchAddresses();
      }
    } catch (error) {
      console.error("Lỗi khi tạo địa chỉ:", error);
      alert("Có lỗi xảy ra khi thêm địa chỉ");
    }
  };

  // Bắt đầu sửa -> mở modal
  const startEditing = (addr) => {
    setEditingId(addr.AddressID);
    setEditForm({
      LocationName: addr.LocationName || "",
      Email: addr.Email || "",
      Phone: addr.Phone || "",
      Address: addr.Address || "",
      Country: addr.Country || "",
    });
    setIsEditModalOpen(true);
  };

  // Hủy sửa -> đóng modal
  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({
      LocationName: "",
      Email: "",
      Phone: "",
      Address: "",
      Country: "",
    });
    setIsEditModalOpen(false);
  };

  // Thay đổi trong form sửa
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  // Cập nhật địa chỉ
  const handleUpdateAddress = async (e) => {
    e.preventDefault();
    if (!editingId) return;
    try {
      const response = await axios.put(
        `http://localhost:2000/api/v1/address/${editingId}`,
        editForm
      );
      if (response.data.error) {
        alert(response.data.error);
      } else {
        alert("Cập nhật địa chỉ thành công!");
        cancelEditing();
        fetchAddresses();
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật địa chỉ:", error);
      alert("Có lỗi xảy ra khi cập nhật địa chỉ");
    }
  };

  // Xóa địa chỉ
const handleDeleteAddress = async (addressId) => {
  console.log("Đang xóa địa chỉ ID:", addressId); // Kiểm tra ID
  if (!window.confirm("Bạn có chắc muốn xóa địa chỉ này?")) return;

  try {
    const response = await axios.delete(`http://localhost:2000/api/v1/address/${addressId}`);
    console.log("Phản hồi API:", response.data);
    alert("Xóa địa chỉ thành công!");
    fetchAddresses();
  } catch (error) {
    console.error("Lỗi khi xóa địa chỉ:", error);
    alert("Có lỗi xảy ra khi xóa địa chỉ");
  }
};


  return (
    <>
    <Navbar/>
    <button onClick={() => navigate(-1)}
      className="flex ml-10 h-12 w-24 items-center justify-center bg-white border-none rounded-md tracking-wide transition-all duration-200 ease-linear shadow-md hover:shadow-xl hover:-translate-y-0.5">
  <svg className="mr-2 ml-2 w-5 h-5 transition-all duration-400 ease-in hover:-translate-x-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" fill="currentColor">
    <path d="M874.690416 495.52477c0 11.2973-9.168824 20.466124-20.466124 20.466124l-604.773963 0 188.083679 188.083679c7.992021 7.992021 7.992021 20.947078 0 28.939099-4.001127 3.990894-9.240455 5.996574-14.46955 5.996574-5.239328 0-10.478655-1.995447-14.479783-5.996574l-223.00912-223.00912c-3.837398-3.837398-5.996574-9.046027-5.996574-14.46955 0-5.433756 2.159176-10.632151 5.996574-14.46955l223.019353-223.029586c7.992021-7.992021 20.957311-7.992021 28.949332 0 7.992021 8.002254 7.992021 20.957311 0 28.949332l-188.073446 188.073446 604.753497 0C865.521592 475.058646 874.690416 484.217237 874.690416 495.52477z"></path>
  </svg>
  <span>Back</span>
</button>
    
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Quản lý Địa chỉ</h1>
      {/* Form tạo địa chỉ mới */}
      <form
        onSubmit={handleCreateAddress}
        className="bg-white shadow-md rounded px-6 py-4 mb-6"
      >
        <h2 className="text-xl font-semibold mb-4">Tạo địa chỉ mới</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium">LocationName:</label>
            <input
              name="LocationName"
              value={newAddress.LocationName}
              onChange={handleNewAddressChange}
              required
              className="border border-gray-300 rounded w-full p-2"
              placeholder="Tên địa điểm"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Email:</label>
            <input
              name="Email"
              value={newAddress.Email}
              onChange={handleNewAddressChange}
              className="border border-gray-300 rounded w-full p-2"
              placeholder="example@gmail.com"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Phone:</label>
            <input
              name="Phone"
              value={newAddress.Phone}
              onChange={handleNewAddressChange}
              className="border border-gray-300 rounded w-full p-2"
              placeholder="Số điện thoại"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Address:</label>
            <input
              name="Address"
              value={newAddress.Address}
              onChange={handleNewAddressChange}
              className="border border-gray-300 rounded w-full p-2"
              placeholder="Địa chỉ chi tiết"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Country:</label>
            <input
              name="Country"
              value={newAddress.Country}
              onChange={handleNewAddressChange}
              className="border border-gray-300 rounded w-full p-2"
              placeholder="Quốc gia"
            />
          </div>
        </div>

        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 rounded mt-4"
        >
          Tạo
        </button>
      </form>

      {/* Danh sách địa chỉ */}
      <div className="bg-white shadow-md rounded p-4">
        <h2 className="text-xl font-semibold mb-4">Danh sách địa chỉ</h2>
        {loading ? (
          <p className="text-gray-500">Đang tải...</p>
        ) : addresses.length === 0 ? (
          <p className="text-gray-500">Không có địa chỉ nào.</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="p-2 text-left">AddressID</th>
                <th className="p-2 text-left">LocationName</th>
                <th className="p-2 text-left">Email</th>
                <th className="p-2 text-left">Phone</th>
                <th className="p-2 text-left">Address</th>
                <th className="p-2 text-left">Country</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {addresses.map((addr) => (
                <tr key={addr.AddressID} className="border-b hover:bg-gray-50">
                  <td className="p-2">{addr.AddressID}</td>
                  <td className="p-2">{addr.LocationName}</td>
                  <td className="p-2">{addr.Email}</td>
                  <td className="p-2">{addr.Phone}</td>
                  <td className="p-2">{addr.Address}</td>
                  <td className="p-2">{addr.Country}</td>
                  <td className="p-2">
                    <button
                      onClick={() => startEditing(addr)}
                      className="bg-yellow-400 text-white px-3 py-1 rounded mr-2 hover:bg-yellow-500"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDeleteAddress(addr.AddressID)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal sửa địa chỉ */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          {/* Hộp modal */}
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-2xl relative">
            <h2 className="text-xl font-semibold mb-4">
              Sửa địa chỉ (ID: {editingId})
            </h2>
            <form onSubmit={handleUpdateAddress}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-medium">
                    LocationName:
                  </label>
                  <input
                    name="LocationName"
                    value={editForm.LocationName}
                    onChange={handleEditChange}
                    required
                    className="border border-gray-300 rounded w-full p-2"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium">Email:</label>
                  <input
                    name="Email"
                    value={editForm.Email}
                    onChange={handleEditChange}
                    className="border border-gray-300 rounded w-full p-2"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium">Phone:</label>
                  <input
                    name="Phone"
                    value={editForm.Phone}
                    onChange={handleEditChange}
                    className="border border-gray-300 rounded w-full p-2"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium">Address:</label>
                  <input
                    name="Address"
                    value={editForm.Address}
                    onChange={handleEditChange}
                    className="border border-gray-300 rounded w-full p-2"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium">Country:</label>
                  <input
                    name="Country"
                    value={editForm.Country}
                    onChange={handleEditChange}
                    className="border border-gray-300 rounded w-full p-2"
                  />
                </div>
              </div>
              <div className="mt-4 flex gap-3">
                <button
                  type="submit"
                  className="bg-green-500 hover:bg-green-600 text-white font-medium px-4 py-2 rounded"
                >
                  Lưu
                </button>
                <button
                  type="button"
                  onClick={cancelEditing}
                  className="bg-gray-400 hover:bg-gray-500 text-white font-medium px-4 py-2 rounded"
                >
                  Hủy
                </button>
              </div>
            </form>
            <button
              onClick={cancelEditing}
              className="absolute top-2 right-2 text-gray-600 hover:text-black"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
    </>
  );
}

export default AddressCustomer;






