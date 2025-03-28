import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import Navbar from "../../layout/navbar";
import Footer from "../../layout/footer";

const CheckoutPage = () => {
  const user = useSelector((state) => state.user.user);
  const customerId = user?.customerId;

  const [cartItems, setCartItems] = useState([]);
  const [productDetails, setProductDetails] = useState({});
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressPanel, setShowAddressPanel] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState("");
  // State cho modal thêm địa chỉ
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    LocationName: "",
    Email: "",
    Phone: "",
    Address: "",
    Country: "",
  });

  // State cho modal sửa địa chỉ
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [editAddress, setEditAddress] = useState({
    LocationName: "",
    Email: "",
    Phone: "",
    Address: "",
    Country: "",
  });

  // Phương thức thanh toán: "cod" hoặc "online"
  const [paymentMethod, setPaymentMethod] = useState("cod");
  // Nếu chọn online, lưu cổng thanh toán (momo, vnpay, paypal)
  const [onlineGateway, setOnlineGateway] = useState("");

  // Loại vận chuyển và chi phí
  const [deliveryType, setDeliveryType] = useState("standard");
  const [deliveryCost, setDeliveryCost] = useState(20000);

  // Danh sách sản phẩm được chọn để thanh toán
  const [selectedItems, setSelectedItems] = useState([]);

  // Hàm tính giá sản phẩm (có SalePrice nếu có)
  const getItemPrice = (item) => {
    const detail = productDetails[item.ProductID];
    if (!detail) return item.Price;
    if (detail.SalePrice > 0 && detail.SalePercent > 0) {
      return detail.SalePrice;
    }
    return item.Price;
  };

  // Lấy giỏ hàng, địa chỉ khi có customerId
  useEffect(() => {
    if (!customerId) return;
    fetchCart();
    fetchAddresses();
  }, [customerId]);

  // Sau khi cartItems thay đổi, mặc định chọn hết
  useEffect(() => {
    if (cartItems.length > 0) {
      setSelectedItems(cartItems);
    }
  }, [cartItems]);

  // API lấy giỏ hàng
  const fetchCart = async () => {
    try {
      const res = await axios.get(`http://localhost:2000/api/v1/cart/${customerId}`);
      const items = res.data.cartItems || [];
      setCartItems(items);
      fetchProductDetails(items);
    } catch (error) {
      console.error("Lỗi khi tải giỏ hàng:", error);
    }
  };

  // API lấy chi tiết sản phẩm
  const fetchProductDetails = async (items) => {
    try {
      const details = {};
      for (let item of items) {
        const res = await axios.get(
          `http://localhost:2000/api/v1/products/${item.ProductID}`
        );
        let product = res.data.data;
        if (Array.isArray(product)) {
          product = product[0];
        }
        if (product) {
          details[item.ProductID] = {
            colors: product.Color
              ? product.Color.split(",").map((c) => c.trim())
              : [],
            sizes: product.Size
              ? product.Size.split(",").map((s) => s.trim())
              : [],
            SalePrice: product.SalePrice || 0,
            SalePercent: product.SalePercent || 0,
          };
        }
      }
      setProductDetails(details);
    } catch (error) {
      console.error("Lỗi khi lấy chi tiết sản phẩm:", error);
    }
  };

  // Xử lý check/uncheck từng sản phẩm
  const handleSelectItem = (e, item) => {
    if (e.target.checked) {
      // Nếu checkbox được tích, thêm sản phẩm vào selectedItems
      setSelectedItems((prev) => [...prev, item]);
    } else {
      // Nếu bỏ tích, loại bỏ sản phẩm khỏi selectedItems
      setSelectedItems((prev) => prev.filter((i) => i.ProductID !== item.ProductID));
    }
  };

  // Tính toán subtotal, tax, total dựa trên selectedItems
  const subtotal = selectedItems.reduce(
    (sum, item) => sum + getItemPrice(item) * item.Quantity,
    0
  );
  const tax = 8;
  const total = subtotal + tax + deliveryCost;

  // Lấy danh sách địa chỉ
  // Lấy danh sách địa chỉ
const fetchAddresses = async () => {
  try {
    const res = await axios.get(`http://localhost:2000/api/v1/address/${customerId}`);
    const data = Array.isArray(res.data) ? res.data : res.data.addresses || [];
    setAddresses(data);

    if (data.length > 0) {
      // Tìm địa chỉ nào là mặc định
      const defaultAddr = data.find((a) => a.IsPickupAddress === 1);
      if (defaultAddr) {
        setSelectedAddress(defaultAddr.AddressID);
      } else {
        // Nếu không có địa chỉ nào là mặc định, bạn có thể chọn địa chỉ đầu tiên
        setSelectedAddress(data[0].AddressID);
      }
    }
  } catch (error) {
    console.error("Lỗi khi lấy địa chỉ:", error);
  }
};


  // Gửi đơn hàng
  const handlePlaceOrder = async () => {
    try {
      if (selectedItems.length === 0) {
        alert("Bạn chưa chọn món đồ nào để thanh toán!");
        return;
      }

     const selectedAddr = addresses.find((a) => a.AddressID === selectedAddress);
    if (!selectedAddr) {
      alert("Vui lòng chọn địa chỉ giao hàng!");
      return;
    }

      // Lấy email để gửi mail (nếu user chưa có, fallback tạm)
     const shippingEmail = selectedEmail || user?.email || "test@example.com";

      // Chuẩn bị shippingAddress để gửi lên server
      const shippingAddressData = {
        locationName: selectedAddr.LocationName,
        phone: selectedAddr.Phone,
        address: selectedAddr.Address,
        country: selectedAddr.Country,
      };

      // Tạo payload đơn hàng, bao gồm luôn các lựa chọn màu và size
      const orderData = {
        customerId,
        items: selectedItems.map((item) => ({
          productId: item.ProductID,
          quantity: item.Quantity,
          price: getItemPrice(item),
          chosenColor: item.Color,  // gửi thông tin màu đã chọn
          chosenSize: item.Size,    // gửi thông tin kích cỡ đã chọn
        })),
        totalAmount: total,
        paymentMethod,
        customerEmail: shippingEmail, // <-- Gửi email từ state
        shippingAddress: {
        locationName: selectedAddr.LocationName,
        phone: selectedAddr.Phone,
        address: selectedAddr.Address,
        country: selectedAddr.Country,
      },
      };

      // Gọi API tạo đơn hàng
      const res = await axios.post(`http://localhost:2000/api/v1/orders`, orderData);
      console.log("Tạo đơn hàng thành công:", res.data);

      // Sau đó xóa các sản phẩm đã thanh toán khỏi giỏ hàng
      const productIdsToDelete = selectedItems.map((item) => item.ProductID);
      await axios.delete(`http://localhost:2000/api/v1/order-clear/${customerId}`, {
        data: { productIds: productIdsToDelete },
      });

      // Cập nhật state giỏ hàng
      setCartItems((prev) =>
        prev.filter((cartItem) => !productIdsToDelete.includes(cartItem.ProductID))
      );
      setSelectedItems([]);

      alert("Đặt hàng thành công!");
    } catch (error) {
      console.error("Lỗi khi đặt hàng:", error);
      alert("Đặt hàng thất bại!");
    }
  };

  // Xử lý địa chỉ
  // const handleSelectAddress = (addressId) => {
  //   setSelectedAddress(addressId);
  //   setShowAddressPanel(false);
  // };
 const handleSelectAddress = async (addressId) => {
  try {
    await axios.put(`http://localhost:2000/api/v1/address/default/${customerId}`, {
      addressId,
    });

    // Tìm địa chỉ được chọn trong state addresses
    const addr = addresses.find((a) => a.AddressID === addressId);
    if (addr) {
      setSelectedAddress(addressId);
      setSelectedEmail(addr.Email); // Lưu email này
    }

    setShowAddressPanel(false);

    // Gọi lại fetchAddresses để DB cập nhật IsPickupAddress
    fetchAddresses();
  } catch (error) {
    console.error("Lỗi khi cập nhật địa chỉ mặc định:", error);
  }
};



  const handleDeleteAddress = async (addressId) => {
    try {
      await axios.delete(`http://localhost:2000/api/v1/address/${addressId}`);
      fetchAddresses();
    } catch (error) {
      console.error("Lỗi khi xóa địa chỉ:", error);
    }
  };

  const handleAddAddress = () => {
    setShowAddressForm(true);
  };

  const handleAddressInputChange = (e) => {
    const { name, value } = e.target;
    setNewAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitNewAddress = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`http://localhost:2000/api/v1/address`, {
        CustomerID: customerId,
        LocationName: newAddress.LocationName,
        Email: newAddress.Email,
        Phone: newAddress.Phone,
        Address: newAddress.Address,
        Country: newAddress.Country,
      });
      fetchAddresses();
      setShowAddressForm(false);
      setNewAddress({
        LocationName: "",
        Email: "",
        Phone: "",
        Address: "",
        Country: "",
      });
    } catch (error) {
      console.error("Lỗi khi thêm địa chỉ mới:", error);
    }
  };

  const handleEditAddress = (address) => {
    setEditingAddressId(address.AddressID);
    setEditAddress({
      LocationName: address.LocationName,
      Email: address.Email,
      Phone: address.Phone,
      Address: address.Address,
      Country: address.Country,
    });
    setIsEditModalOpen(true);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateAddress = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:2000/api/v1/address/${editingAddressId}`, editAddress);
      fetchAddresses();
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Lỗi khi cập nhật địa chỉ:", error);
    }
  };

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-4 lg:p-6">
        <h2 className="text-2xl font-semibold mb-6">Thanh Toán</h2>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Cột bên trái */}
          <div className="flex-1 space-y-6">
            {/* Địa chỉ */}
            <div className="bg-white rounded-lg shadow p-6">
  <h3 className="text-xl font-semibold mb-4">Địa chỉ giao hàng</h3>

  {/* Chỉ hiển thị địa chỉ mặc định / đang chọn */}
  <div className="mb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
    <div>
      {selectedAddress ? (
        (() => {
          const addr = addresses.find((a) => a.AddressID === selectedAddress);
          return addr ? (
            <div>
              <p className="text-base font-medium">
                {addr.LocationName} - {addr.Address}, {addr.Country}, {addr.Email} - {addr.Phone}
              </p>
              {addr.IsPickupAddress === 1 && (
                <span className="text-sm text-green-600 font-semibold">
                  (Mặc định)
                </span>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500">Địa chỉ chưa xác định</p>
          );
        })()
      ) : (
        <p className="text-sm text-gray-500">Chưa có địa chỉ được lưu</p>
      )}
    </div>

    {/* Nút để mở panel chọn/sửa địa chỉ */}
    <button
      onClick={() => setShowAddressPanel(true)}
      className="inline-flex items-center gap-2 text-sm bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M5 13l4 4L19 7"
        />
      </svg>
      Chọn / Sửa
    </button>
  </div>

  {/* Nếu showAddressPanel = true thì mới hiển thị danh sách địa chỉ đầy đủ */}
  {showAddressPanel && (
    <div className="mt-4 border border-gray-200 rounded-lg bg-gray-50 p-4">
      <h4 className="text-lg font-semibold mb-3 text-gray-700">Danh sách địa chỉ</h4>

      {addresses.length > 0 ? (
        addresses.map((addr) => (
          <div
            key={addr.AddressID}
            className="p-3 mb-2 last:mb-0 bg-white rounded-md shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="text-sm text-gray-600">
              <span className="font-medium text-gray-800">{addr.LocationName}</span> – {addr.Address}, {addr.Country}, {addr.Email} – {addr.Phone}
              {addr.IsPickupAddress === 1 && (
                <span className="ml-2 text-xs text-green-600 font-semibold">
                  (Mặc định)
                </span>
              )}
            </div>
            <div className="flex gap-2 mt-3 sm:mt-0">
              <button
                onClick={() => handleSelectAddress(addr.AddressID)}
                className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3 w-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Chọn
              </button>
              <button
                onClick={() => handleEditAddress(addr)}
                className="flex items-center gap-1 bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-xs transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3 w-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15.232 5.232l3.536 3.536M4 13.314V19h5.686l9.482-9.482-3.536-3.536L4 13.314z"
                  />
                </svg>
                Sửa
              </button>
              <button
                onClick={() => handleDeleteAddress(addr.AddressID)}
                className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3 w-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 13h6m2 0a2 2 0 11-4 0m0 4a2 2 0 11-4 0M5 7h14"
                  />
                </svg>
                Xóa
              </button>
            </div>
          </div>
        ))
      ) : (
        <p className="text-sm text-gray-500">Chưa có địa chỉ nào được lưu</p>
      )}

      {/* Nút thêm địa chỉ + đóng panel */}
      <div className="mt-4 flex gap-3">
        <button
          onClick={handleAddAddress}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          Thêm địa chỉ mới
        </button>
        <button
          onClick={() => setShowAddressPanel(false)}
          className="inline-flex items-center gap-2 bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded text-sm transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M6 18L18 6M6 6l12 12" 
            />
          </svg>
          Đóng
        </button>
      </div>
    </div>
  )}
</div>


            {/* Vận chuyển */}
            <div className="bg-white rounded shadow p-4">
              <h3 className="text-lg font-medium mb-2">Phương thức vận chuyển</h3>
              <div>
                <label className="inline-flex items-center gap-2 mb-2">
                  <input
                    type="radio"
                    name="deliveryType"
                    value="standard"
                    checked={deliveryType === "standard"}
                    onChange={(e) => {
                      setDeliveryType(e.target.value);
                      setDeliveryCost(20.00);
                    }}
                  />
                  <span>Standard (20.000 đ)</span>
                </label>
                <br />
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    name="deliveryType"
                    value="express"
                    checked={deliveryType === "express"}
                    onChange={(e) => {
                      setDeliveryType(e.target.value);
                      setDeliveryCost(30.00);
                    }}
                  />
                  <span>Express (30.000 đ)</span>
                </label>
              </div>
            </div>

            {/* Thanh toán */}
            <div className="bg-white rounded shadow p-4">
              <h3 className="text-lg font-medium mb-2">Phương thức thanh toán</h3>
              <div className="space-y-2">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span>Thanh toán khi nhận hàng (COD)</span>
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="online"
                    checked={paymentMethod === "online"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span>Thanh toán online</span>
                </label>
              </div>
              {paymentMethod === "online" && (
                <div className="mt-4 space-y-2">
                  <p className="font-medium">Chọn cổng thanh toán:</p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setOnlineGateway("momo")}
                      className={`w-full bg-gradient-to-r from-green-400 to-green-600 text-white font-semibold py-2 rounded-lg shadow-lg transform transition-all duration-200 hover:shadow-xl hover:-translate-y-1 active:shadow-md active:translate-y-0 ${
                        onlineGateway === "momo" && "ring-2 ring-green-800"
                      }`}
                    >
                      MoMo
                    </button>
                    <button
                      onClick={() => setOnlineGateway("vnpay")}
                      className={`w-full bg-gradient-to-r from-purple-400 to-purple-600 text-white font-semibold py-2 rounded-lg shadow-lg transform transition-all duration-200 hover:shadow-xl hover:-translate-y-1 active:shadow-md active:translate-y-0 ${
                        onlineGateway === "vnpay" && "ring-2 ring-purple-800"
                      }`}
                    >
                      VNPay
                    </button>
                    <button
                      onClick={() => setOnlineGateway("paypal")}
                      className={`w-full bg-gradient-to-r from-blue-400 to-blue-600 text-white font-semibold py-2 rounded-lg shadow-lg transform transition-all duration-200 hover:shadow-xl hover:-translate-y-1 active:shadow-md active:translate-y-0 ${
                        onlineGateway === "paypal" && "ring-2 ring-blue-800"
                      }`}
                    >
                      PayPal
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Cột bên phải: Tóm tắt đơn hàng */}
          <div className="w-full lg:w-1/3">
            <div className="bg-white rounded shadow p-4 mb-6">
              <h3 className="text-lg font-medium mb-2">Thông tin sản phẩm</h3>
              <div className="divide-y">
                {cartItems.map((item) => {
                  const priceToShow = getItemPrice(item);
                  return (
                    <div key={item.ProductID} className="flex justify-between items-center py-2">
                      <div className="flex items-center gap-3">
                        {/* Checkbox để chọn sản phẩm */}
                        <input
                          type="checkbox"
                          checked={selectedItems.some((i) => i.ProductID === item.ProductID)}
                          onChange={(e) => handleSelectItem(e, item)}
                        />
                        <img
                          src={
                            item.ImageURL
                              ? `http://localhost:2000/image/${item.ImageURL.split(",")[0]}`
                              : "/images/default.jpg"
                          }
                          alt={item.Name}
                          className="w-16 h-16 rounded object-cover border"
                        />
                        <div>
                          <p className="text-sm font-semibold">{item.Name}</p>
                          <p className="text-xs text-gray-500">Số lượng: {item.Quantity}</p>
                          <p className="text-xs text-gray-500">Size: {item.Size}</p>
                          <p className="text-xs text-gray-500">Màu: {item.Color}</p>
                        </div>
                      </div>
                      <span className="text-sm font-medium">
                        {(priceToShow * item.Quantity).toFixed(2)} đ
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded shadow p-4">
              <h3 className="text-lg font-medium mb-2">Tóm tắt đơn hàng</h3>
              <div className="flex justify-between text-sm mb-1">
                <span>Tạm tính:</span>
                <span>{subtotal.toFixed(3)} đ</span>
              </div>
              <div className="flex justify-between text-sm mb-1">
                <span>Phí vận chuyển:</span>
                <span>{deliveryCost.toFixed(3)} đ</span>
              </div>
              <div className="flex justify-between text-sm mb-1">
                <span>Thuế:</span>
                <span>{tax.toFixed(3)} đ</span>
              </div>
              <div className="flex justify-between font-semibold text-base mt-3 border-t pt-3">
                <span>Tổng cộng:</span>
                <span>{total.toFixed(3)} đ</span>
              </div>
              <button
                onClick={handlePlaceOrder}
                className="w-full mt-4 bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold py-3 rounded-lg shadow-lg transform transition-all duration-200 hover:shadow-xl hover:-translate-y-1 active:shadow-md active:translate-y-0"
              >
                Đặt hàng
              </button>
            </div>
          </div>
        </div>

        {/* Modal form thêm địa chỉ mới */}
        {showAddressForm && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="absolute inset-0 bg-black bg-opacity-50"></div>
            <div className="bg-white p-6 rounded shadow-lg z-10 w-full max-w-md">
              <h3 className="text-xl font-medium mb-4">Thêm địa chỉ mới</h3>
              <form onSubmit={handleSubmitNewAddress}>
                <div className="mb-3">
                  <label className="block mb-1 text-sm font-semibold">Location Name</label>
                  <input
                    type="text"
                    name="LocationName"
                    value={newAddress.LocationName}
                    onChange={handleAddressInputChange}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="block mb-1 text-sm font-semibold">Email</label>
                  <input
                    type="email"
                    name="Email"
                    value={newAddress.Email}
                    onChange={handleAddressInputChange}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="block mb-1 text-sm font-semibold">Phone</label>
                  <input
                    type="tel"
                    name="Phone"
                    value={newAddress.Phone}
                    onChange={handleAddressInputChange}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="block mb-1 text-sm font-semibold">Address</label>
                  <input
                    type="text"
                    name="Address"
                    value={newAddress.Address}
                    onChange={handleAddressInputChange}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="block mb-1 text-sm font-semibold">Country</label>
                  <input
                    type="text"
                    name="Country"
                    value={newAddress.Country}
                    onChange={handleAddressInputChange}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    type="submit"
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded"
                  >
                    Lưu địa chỉ
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddressForm(false)}
                    className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-2 rounded"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal form sửa địa chỉ */}
        {isEditModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="absolute inset-0 bg-black bg-opacity-50"></div>
            <div className="bg-white p-6 rounded shadow-lg z-10 w-full max-w-md">
              <h3 className="text-xl font-medium mb-4">Sửa địa chỉ</h3>
              <form onSubmit={handleUpdateAddress}>
                <div className="mb-3">
                  <label className="block mb-1 text-sm font-semibold">Location Name</label>
                  <input
                    type="text"
                    name="LocationName"
                    value={editAddress.LocationName}
                    onChange={handleEditInputChange}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="block mb-1 text-sm font-semibold">Email</label>
                  <input
                    type="email"
                    name="Email"
                    value={editAddress.Email}
                    onChange={handleEditInputChange}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="block mb-1 text-sm font-semibold">Phone</label>
                  <input
                    type="tel"
                    name="Phone"
                    value={editAddress.Phone}
                    onChange={handleEditInputChange}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="block mb-1 text-sm font-semibold">Address</label>
                  <input
                    type="text"
                    name="Address"
                    value={editAddress.Address}
                    onChange={handleEditInputChange}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="block mb-1 text-sm font-semibold">Country</label>
                  <input
                    type="text"
                    name="Country"
                    value={editAddress.Country}
                    onChange={handleEditInputChange}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    type="submit"
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded"
                  >
                    Lưu thay đổi
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-2 rounded"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      <Footer/>
    </>
  );
};

export default CheckoutPage;










