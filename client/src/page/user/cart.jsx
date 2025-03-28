import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import Navbar from "../../layout/navbar";
import { Link, useNavigate } from "react-router";
import Footer from "../../layout/footer";

const Cart = () => {
  const user = useSelector((state) => state.user.user);
  const customerId = user?.customerId;

  const [cartItems, setCartItems] = useState([]);
  // productDetails lưu thông tin từ bảng products (hoặc JOIN salereport)
  const [productDetails, setProductDetails] = useState({});

  // Lưu ID item vừa update
  const [updatedItemId, setUpdatedItemId] = useState(null);

  console.log("customerId:", customerId);

  // 1) Lấy danh sách cartItems
  useEffect(() => {
    if (!customerId) return;
    fetchCart();
  }, [customerId]);

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

  // 2) Lấy chi tiết sản phẩm (bao gồm SalePrice, SalePercent, v.v.)
  const fetchProductDetails = async (items) => {
    try {
      const details = {};
      // Lặp qua mỗi item
      for (let item of items) {
        // Gọi API lấy product (JOIN salereport nếu cần)
        const res = await axios.get(
          `http://localhost:2000/api/v1/products/${item.ProductID}`
        );
        // Giả sử server trả về { success: true, data: [ { ... } ] }
        let product = res.data.data;
        if (Array.isArray(product)) {
          product = product[0];
        }
        if (product) {
          // Lưu vào details, key là ProductID
          details[item.ProductID] = {
            colors: product.Color
              ? product.Color.split(",").map((c) => c.trim())
              : [],
            sizes: product.Size
              ? product.Size.split(",").map((s) => s.trim())
              : [],
            // Nếu có sale, server trả về SalePrice, SalePercent
            SalePrice: product.SalePrice || 0,
            SalePercent: product.SalePercent || 0,
            // ... có thể lưu thêm ...
          };
        }
      }
      setProductDetails(details);
    } catch (error) {
      console.error("Lỗi khi lấy chi tiết sản phẩm:", error);
    }
  };

  // 3) Hàm update CartItem
  const handleUpdateCartItem = async (productId, updatedData) => {
    try {
      await axios.put(
        `http://localhost:2000/api/v1/cart/${customerId}/${productId}`,
        updatedData
      );
      // Gọi lại fetchCart để đồng bộ
      fetchCart();
      setUpdatedItemId(productId);
      // Clear highlight sau 1s
      setTimeout(() => setUpdatedItemId(null), 1000);
    } catch (error) {
      console.error("Lỗi khi cập nhật sản phẩm:", error);
    }
  };

  // 4) Xóa item
  const handleRemove = async (productId) => {
    try {
      await axios.delete(`http://localhost:2000/api/v1/cart/${customerId}/${productId}`);
      setCartItems((prev) => prev.filter((item) => item.ProductID !== productId));
    } catch (error) {
      console.error("Lỗi khi xóa sản phẩm:", error);
    }
  };

  // 5) Tính subtotal, thuế, shipping, total
  // => Dựa trên giá đã giảm (SalePrice) nếu có
  const getItemPrice = (item) => {
    const detail = productDetails[item.ProductID];
    if (!detail) return item.Price; // Nếu chưa load detail, tạm dùng item.Price
    // Nếu có SalePrice > 0 => dùng SalePrice
    if (detail.SalePrice > 0 && detail.SalePercent > 0) {
      return detail.SalePrice;
    }
    // Nếu không, dùng Price gốc
    return item.Price;
  };

  const subtotal = cartItems.reduce((sum, item) => {
    return sum + getItemPrice(item) * item.Quantity;
  }, 0);

  const tax = 8;
  const shipping = subtotal > 200 ? 0 : 12;
  const total = subtotal + tax + shipping;
const navigate = useNavigate();
  return (
    <>
      <Navbar />
       <button onClick={() => navigate(-1)}
      className="flex h-12 w-24 items-center justify-center bg-white border-none rounded-md tracking-wide transition-all duration-200 ease-linear shadow-md hover:shadow-xl hover:-translate-y-0.5">
  <svg className="mr-2 ml-2 w-5 h-5 transition-all duration-400 ease-in hover:-translate-x-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" fill="currentColor">
    <path d="M874.690416 495.52477c0 11.2973-9.168824 20.466124-20.466124 20.466124l-604.773963 0 188.083679 188.083679c7.992021 7.992021 7.992021 20.947078 0 28.939099-4.001127 3.990894-9.240455 5.996574-14.46955 5.996574-5.239328 0-10.478655-1.995447-14.479783-5.996574l-223.00912-223.00912c-3.837398-3.837398-5.996574-9.046027-5.996574-14.46955 0-5.433756 2.159176-10.632151 5.996574-14.46955l223.019353-223.029586c7.992021-7.992021 20.957311-7.992021 28.949332 0 7.992021 8.002254 7.992021 20.957311 0 28.949332l-188.073446 188.073446 604.753497 0C865.521592 475.058646 874.690416 484.217237 874.690416 495.52477z"></path>
  </svg>
  <span>Back</span>
</button>
      <div className="p-6 container mx-auto">
        <h2 className="text-2xl font-semibold mb-4">Giỏ hàng của bạn</h2>

        <div className="bg-gray-100 p-4 rounded-lg">
          {cartItems.map((item) => {
            const detail = productDetails[item.ProductID] || {};
            const colors = detail.colors || [];
            const sizes = detail.sizes || [];

            // Tính giá (dựa trên sale)
            const priceToShow = getItemPrice(item);

            return (
              <div
                key={item.ProductID}
                className={`flex items-center gap-4 p-4 mb-4 border rounded-lg transition-colors duration-300 ${
                  item.ProductID === updatedItemId ? "bg-green-100" : ""
                }`}
              >
                {/* Nút xóa */}
                <button
                  onClick={() => handleRemove(item.ProductID)}
                  className="text-red-500"
                >
                  &times;
                </button>

                {/* Ảnh */}
                <img
                  src={
                    item.ImageURL
                      ? `http://localhost:2000/image/${item.ImageURL.split(",")[0]}`
                      : "/images/default.jpg"
                  }
                  alt={item.Name}
                  className="w-16 h-16 rounded-lg object-cover"
                />

                {/* Thông tin */}
                <div className="flex-1">
                  <h3 className="text-lg font-medium">{item.Name}</h3>

                  {/* Nếu có sale => hiển thị giá gốc bị gạch */}
                  {detail.SalePrice > 0 && detail.SalePercent > 0 ? (
                    <>
                      <p className="text-gray-500 line-through">
                        {item.Price} đ
                      </p>
                      <p className="text-red-600 font-semibold">
                        {priceToShow} đ
                      </p>
                    </>
                  ) : (
                    <p className="text-gray-700 font-semibold">
                      {item.Price} đ
                    </p>
                  )}

                  {/* Dropdown màu (nếu có) */}
                  {colors.length > 0 && (
                    <select
                      value={item.Color || ""}
                      onChange={(e) =>
                        handleUpdateCartItem(item.ProductID, {
                          color: e.target.value,
                        })
                      }
                      className="border p-1 rounded text-sm mt-1"
                    >
                      {colors.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  )}

                  {/* Dropdown size (nếu có) */}
                  {sizes.length > 0 && (
                    <select
                      value={item.Size || ""}
                      onChange={(e) =>
                        handleUpdateCartItem(item.ProductID, {
                          size: e.target.value,
                        })
                      }
                      className="border p-1 rounded text-sm mt-1 ml-2"
                    >
                      {sizes.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Nút tăng/giảm số lượng */}
                <div className="flex items-center gap-2">
                  <button
                    className="border p-2 rounded transition-transform duration-150 hover:scale-105 active:scale-95"
                    onClick={() =>
                      handleUpdateCartItem(item.ProductID, {
                        quantity: Math.max(1, item.Quantity - 1),
                      })
                    }
                    disabled={item.Quantity <= 1}
                  >
                    -
                  </button>
                  <span className="w-6 text-center">{item.Quantity}</span>
                  <button
                    className="border p-2 rounded transition-transform duration-150 hover:scale-105 active:scale-95"
                    onClick={() =>
                      handleUpdateCartItem(item.ProductID, {
                        quantity: item.Quantity + 1,
                      })
                    }
                  >
                    +
                  </button>
                </div>

                {/* Thành tiền */}
                <p className="font-semibold">
                  {(priceToShow * item.Quantity).toFixed(2)} đ
                </p>
              </div>
            );
          })}
        </div>

        {/* Tóm tắt đơn hàng */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg w-full md:w-1/3 mx-auto border">
          <h3 className="text-xl font-semibold">Tóm tắt đơn hàng</h3>
          <p className="flex justify-between mt-2">
            <span>Tạm tính:</span>
            <span>{subtotal.toFixed(2)} đ</span>
          </p>
          <p className="flex justify-between">
            <span>Phí vận chuyển:</span>
            <span>{shipping.toFixed(2)} đ</span>
          </p>
          <p className="flex justify-between">
            <span>Thuế:</span>
            <span>{tax.toFixed(2)} đ</span>
          </p>
          <p className="flex justify-between font-bold text-lg mt-2">
            <span>Tổng cộng:</span>
            <span>{total.toFixed(2)} đ</span>
          </p>
          <button  className="w-full mt-4 bg-black text-white p-2 rounded">
            <Link to="/dat-hang">
            Đặt hàng
            </Link>
          </button>
        </div>
      </div>
      <Footer/>
    </>
  );
};

export default Cart;











