import { useEffect, useState } from "react";
import axios from "axios";

const ORDER_STATUSES = [
  { value: "dang_xu_ly", label: "Đang xử lý" },
  { value: "dang_giao", label: "Đang giao" },
  { value: "da_giao", label: "Đã giao" },
  { value: "da_huy", label: "Đã hủy" },
];

const getStatusLabel = (statusValue) => {
  const status = ORDER_STATUSES.find((st) => st.value === statusValue);
  return status ? status.label : statusValue;
};

function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [showFilterOptions, setShowFilterOptions] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 6;
  const [searchTerm, setSearchTerm] = useState("");

  // State cho modal xem chi tiết đơn hàng
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // State cho modal cập nhật trạng thái đơn hàng
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState({
    OrderID: null,
    OrderStatus: "",
  });

  // Lấy danh sách đơn hàng từ API
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:2000/api/v1/order");
      setOrders(res.data);
      setCurrentPage(1);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách đơn hàng:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Lọc theo trạng thái và ô tìm kiếm (theo tên người đặt và số điện thoại)
  const filteredOrders = orders.filter((order) => {
    if (selectedStatus && order.OrderStatus !== selectedStatus) return false;
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      return (
        (order.CustomerName && order.CustomerName.toLowerCase().includes(lowerSearch)) ||
        (order.ShippingPhone && order.ShippingPhone.toLowerCase().includes(lowerSearch))
      );
    }
    return true;
  });

  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);

  // Mở modal xem chi tiết đơn hàng
  const openDetailModal = (order) => {
    setSelectedOrder(order);
    setDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setDetailModalOpen(false);
    setSelectedOrder(null);
  };

  // Mở modal cập nhật trạng thái
  const openEditModal = (order) => {
    setEditingOrder({
      OrderID: order.OrderID,
      OrderStatus: order.OrderStatus,
    });
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditingOrder({
      OrderID: null,
      OrderStatus: "",
    });
  };

  const handleFilterSelect = (status) => {
    setSelectedStatus(status);
    setShowFilterOptions(false);
    setCurrentPage(1);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleStatusChange = (e) => {
    setEditingOrder((prev) => ({ ...prev, OrderStatus: e.target.value }));
  };

  const updateOrderStatus = async () => {
    try {
      await axios.put(`http://localhost:2000/api/v1/order/${editingOrder.OrderID}`, {
        orderStatus: editingOrder.OrderStatus,
      });
      alert("Cập nhật trạng thái thành công!");
      closeEditModal();
      fetchOrders();
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái:", error);
      alert("Cập nhật trạng thái thất bại!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-3xl font-bold text-center mb-6">Quản lý Đơn hàng</h1>
        {/* Ô tìm kiếm */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên người đặt hoặc số điện thoại..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="flex-1 border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {/* Dropdown lọc đơn hàng */}
          <div className="relative">
            <button
              onClick={() => setShowFilterOptions(!showFilterOptions)}
              className="px-4 py-3 border rounded-lg bg-white shadow-sm hover:bg-gray-50 focus:outline-none"
            >
              {selectedStatus
                ? ORDER_STATUSES.find((st) => st.value === selectedStatus).label
                : "Lọc đơn hàng"}
            </button>
            {showFilterOptions && (
              <div className="absolute mt-2 w-48 border rounded-lg bg-white shadow-lg z-10">
                <button
                  onClick={() => handleFilterSelect("")}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-200"
                >
                  Tất cả
                </button>
                {ORDER_STATUSES.map((status) => (
                  <button
                    key={status.value}
                    onClick={() => handleFilterSelect(status.value)}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-200"
                  >
                    {status.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <p className="text-center">Đang tải...</p>
        ) : currentOrders.length === 0 ? (
          <p className="text-center">Không có đơn hàng nào.</p>
        ) : (
          <>
            {/* Hiển thị danh sách đơn hàng dạng bảng */}
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border divide-y divide-gray-200">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Mã đơn hàng</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Trạng thái</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Tên người đặt</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Hành động</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentOrders.map((order) => (
                    <tr key={order.OrderID}>
                      <td className="px-6 py-4 text-sm text-gray-800">{order.OrderID}</td>
                      <td className="px-6 py-4 text-sm text-gray-800">{getStatusLabel(order.OrderStatus)}</td>
                      <td className="px-6 py-4 text-sm text-gray-800">{order.CustomerName || "N/A"}</td>
                      <td className="px-6 py-4 text-center space-x-2">
                        <button
                          onClick={() => openDetailModal(order)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition"
                        >
                          Xem chi tiết
                        </button>
                        <button
                          onClick={() => openEditModal(order)}
                          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition"
                        >
                          Cập nhật trạng thái
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Phân trang */}
            {totalPages > 1 && (
              <div className="mt-6 flex justify-center space-x-2">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => handlePageChange(i + 1)}
                    className={`px-4 py-2 rounded-lg border ${
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
          </>
        )}
      </div>

      {/* Modal xem chi tiết đơn hàng */}
      {detailModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg relative overflow-auto max-h-screen shadow-xl">
            <button
              onClick={closeDetailModal}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-4">Chi tiết đơn hàng: {selectedOrder.OrderID}</h2>
            <div className="space-y-3 mb-4">
              <p>
                <span className="font-semibold">Tên người đặt:</span> {selectedOrder.CustomerName || "N/A"}
              </p>
              <p>
                <span className="font-semibold">Số điện thoại:</span> {selectedOrder.ShippingPhone || "N/A"}
              </p>
              <p>
                <span className="font-semibold">Địa chỉ:</span>{" "}
                {selectedOrder.ShippingAddress}
                {selectedOrder.ShippingName ? `, ${selectedOrder.ShippingName}` : ""}
                {selectedOrder.ShippingCountry ? `, ${selectedOrder.ShippingCountry}` : ""}
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Sản phẩm đã đặt</h3>
              {selectedOrder.items && selectedOrder.items.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="px-4 py-2 text-sm font-medium text-gray-700">Ảnh</th>
                      <th className="px-4 py-2 text-sm font-medium text-gray-700">Tên sản phẩm</th>
                      <th className="px-4 py-2 text-sm font-medium text-gray-700">Số lượng</th>
                      <th className="px-4 py-2 text-sm font-medium text-gray-700">Size</th>
                      <th className="px-4 py-2 text-sm font-medium text-gray-700">Màu sắc</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedOrder.items.map((item) => (
                      <tr key={item.ProductID}>
                        <td className="px-4 py-2">
                          <img
                            src={`http://localhost:2000/image/${item.ImageURL.split(",")[0].trim()}`}
                            alt={item.Name}
                            className="w-16 h-16 object-cover rounded"
                          />
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-800">{item.Name}</td>
                        <td className="px-4 py-2 text-sm text-gray-800">{item.Quantity}</td>
                        <td className="px-4 py-2 text-sm text-gray-800">{item.Size}</td>
                        <td className="px-4 py-2 text-sm text-gray-800">{item.Color}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-center">Không có sản phẩm nào.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal cập nhật trạng thái đơn hàng */}
      {editModalOpen && editingOrder.OrderID && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md relative shadow-xl">
            <button
              onClick={closeEditModal}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-4">
              Cập nhật trạng thái đơn hàng: {editingOrder.OrderID}
            </h2>
            <div className="mb-4">
              <label className="block mb-2 font-medium">Trạng thái</label>
              <select
                value={editingOrder.OrderStatus}
                onChange={handleStatusChange}
                className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {ORDER_STATUSES.map((st) => (
                  <option key={st.value} value={st.value}>
                    {st.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-4">
              <button
                onClick={updateOrderStatus}
                className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-lg transition"
              >
                Lưu
              </button>
              <button
                onClick={closeEditModal}
                className="bg-gray-400 hover:bg-gray-500 text-white px-5 py-2 rounded-lg transition"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrdersPage;








