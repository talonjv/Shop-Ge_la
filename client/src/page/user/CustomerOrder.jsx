import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import Navbar from "../../layout/navbar";
import { useNavigate } from "react-router-dom";
import Footer from "../../layout/footer";

// Mảng trạng thái
const ORDER_STATUSES = [
  { value: "dang_xu_ly", label: "Đang xử lý" },
  { value: "dang_giao", label: "Đang giao" },
  { value: "da_giao",  label: "Đã giao" },
  { value: "da_huy",   label: "Đã hủy" },
];

// Hàm lấy label từ value
function getStatusLabel(statusValue) {
  const found = ORDER_STATUSES.find(st => st.value === statusValue);
  return found ? found.label : statusValue;
}

function CustomerOrders() {
  const customerId = useSelector((state) => state.user.user.customerId);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    if (customerId) {
      fetchOrders(customerId);
    }
  }, [customerId]);

  const fetchOrders = async (id) => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`http://localhost:2000/api/v1/order/customer/${id}`);
      setOrders(res.data);
    } catch (err) {
      console.error("Lỗi khi lấy đơn hàng:", err);
      setError("Không thể tải danh sách đơn hàng. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  // Hàm format tiền VND
  const formatVND = (value) => {
    if (!value) return "0";
    return value.toLocaleString("vi-VN");
  };

  // Hàm xử lý hủy đơn hàng
  const cancelOrder = async (orderID) => {
    const confirmCancel = window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này không?");
    if (!confirmCancel) return;

    try {
      // Gọi API cập nhật trạng thái đơn hàng thành "da_huy"
      const res = await axios.put(`http://localhost:2000/api/v1/order/${orderID}`, {
        orderStatus: "da_huy"
      });
      if (res.data.message) {
        // Sau khi cập nhật thành công, làm mới danh sách đơn hàng
        fetchOrders(customerId);
      }
    } catch (err) {
      console.error("Lỗi khi hủy đơn hàng:", err);
      alert("Có lỗi xảy ra khi hủy đơn hàng, vui lòng thử lại!");
    }
  };

  // Lọc đơn hàng theo trạng thái
  const filteredOrders = orders.filter(order => {
    if (filterStatus === "all") return true;
    return order.OrderStatus === filterStatus;
  });

  if (!customerId) {
    return (
      <div className="container mx-auto p-4">
        <p className="text-red-500">Bạn cần đăng nhập để xem đơn hàng.</p>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-4 max-w-2xl">
        <h2 className="text-2xl font-bold mb-4">Đơn hàng của bạn</h2>
        <button 
          onClick={() => navigate(-1)}
          className="flex mb-4 h-12 w-24 items-center justify-center bg-white border-none rounded-md tracking-wide transition-all duration-200 ease-linear shadow-md hover:shadow-xl hover:-translate-y-0.5"
        >
          <svg className="mr-2 ml-2 w-5 h-5 transition-all duration-400 ease-in hover:-translate-x-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" fill="currentColor">
            <path d="M874.690416 495.52477c0 11.2973-9.168824 20.466124-20.466124 20.466124l-604.773963 0 188.083679 188.083679c7.992021 7.992021 7.992021 20.947078 0 28.939099-4.001127 3.990894-9.240455 5.996574-14.46955 5.996574-5.239328 0-10.478655-1.995447-14.479783-5.996574l-223.00912-223.00912c-3.837398-3.837398-5.996574-9.046027-5.996574-14.46955 0-5.433756 2.159176-10.632151 5.996574-14.46955l223.019353-223.029586c7.992021-7.992021 20.957311-7.992021 28.949332 0 7.992021 8.002254 7.992021 20.957311 0 28.949332l-188.073446 188.073446 604.753497 0C865.521592 475.058646 874.690416 484.217237 874.690416 495.52477z"></path>
          </svg>
          <span>Back</span>
        </button>

        {/* Bộ lọc trạng thái đơn hàng */}
        <div className="mb-4">
          <label className="mr-2 font-medium" htmlFor="statusFilter">Lọc theo trạng thái:</label>
          <select 
            id="statusFilter" 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border px-2 py-1 rounded"
          >
            <option value="all">Tất cả</option>
            {ORDER_STATUSES.map(status => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>
        </div>

        {loading && <p>Đang tải đơn hàng...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {filteredOrders.length === 0 && !loading && !error && (
          <p>Không có đơn hàng nào.</p>
        )}

        {filteredOrders.map((order) => (
          <div key={order.OrderID} className="bg-white shadow rounded p-4 mb-4">
            {/* Thông tin cơ bản */}
            <div className="mb-2">
              <span className="text-sm text-gray-500 hidden">
                Mã đơn hàng: <strong>{order.OrderID}</strong>
              </span>
              <span className="ml-4 text-sm text-gray-500">
                Trạng thái: <strong>{getStatusLabel(order.OrderStatus)}</strong>
              </span>
            </div>

            {/* Danh sách sản phẩm */}
            <div>
              {order.details && order.details.length > 0 ? (
                order.details.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between border-b py-3 last:border-b-0"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={`http://localhost:2000/image/${item.ImageURL}`}
                        alt={item.Name}
                        className="w-16 h-16 rounded object-cover border"
                      />
                      <div>
                        <p className="font-medium">{item.Name}</p>
                        <p className="text-sm text-gray-600">
                          Màu: {item.Color} | Size: {item.Size}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-red-500 font-semibold">
                        {formatVND(item.Price)} đ
                      </p>
                      <p className="text-sm text-gray-500">x{item.Quantity}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">Không có sản phẩm nào.</p>
              )}
            </div>

            {/* Tổng tiền và nút hủy đơn hàng */}
            <div className="flex items-center justify-between mt-3">
              <div>
                <span className="text-sm">Thành tiền: </span>
                <span className="text-lg font-bold text-red-600">
                  {formatVND(order.TotalAmount)} đ
                </span>
              </div>
              {order.OrderStatus !== "da_huy" && (
                <button 
                  onClick={() => cancelOrder(order.OrderID)}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                >
                  Hủy đơn hàng
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      <Footer/>
    </>
  );
}

export default CustomerOrders;


