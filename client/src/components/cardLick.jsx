import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { IoClose } from "react-icons/io5";
import { FiMinus, FiPlus } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function CartReview({ onClose, onCartUpdated }) {
  // Lấy user từ Redux
  const user = useSelector((state) => state.user.user);
  const customerId = user?.customerId;

  const [cartItems, setCartItems] = useState([]);
  const [productDetails, setProductDetails] = useState({});
  const navigate = useNavigate();

  // 1) Lấy giỏ hàng khi component mount
  useEffect(() => {
    if (!customerId) return;
    fetchCart();
  }, [customerId]);

  // Hàm gọi API lấy giỏ hàng
  const fetchCart = async () => {
    try {
      const res = await axios.get(`http://localhost:2000/api/v1/cart/${customerId}`);
      const items = res.data.cartItems || [];
      setCartItems(items);

      // Lấy thêm thông tin (bao gồm SalePrice, SalePercent)
      fetchProductDetails(items);
    } catch (error) {
      console.error("Lỗi khi lấy giỏ hàng:", error);
    }
  };

  // 2) Lấy chi tiết sản phẩm (SalePrice, SalePercent, Color, Size) cho từng item
  const fetchProductDetails = async (items) => {
    try {
      const details = {};
      for (let item of items) {
        const res = await axios.get(
          `http://localhost:2000/api/v1/products/${item.ProductID}`
        );
        let product = res.data.data;

        // Nếu trả về mảng, lấy phần tử đầu
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
            // Chuyển sang number
            SalePrice: Number(product.SalePrice) || 0,
            SalePercent: Number(product.SalePercent) || 0,
          };
        }
      }
      setProductDetails(details);
    } catch (error) {
      console.error("Lỗi khi lấy chi tiết sản phẩm:", error);
    }
  };

  // Hàm tính giá (nếu có sale => dùng SalePrice, ngược lại dùng item.Price)
  const getItemPrice = (item) => {
    const detail = productDetails[item.ProductID];
    // Nếu chưa load detail, dùng item.Price (cũng parse sang number)
    if (!detail) return Number(item.Price) || 0;

    // Nếu SalePrice & SalePercent > 0 => dùng SalePrice
    if (detail.SalePrice > 0 && detail.SalePercent > 0) {
      return detail.SalePrice;
    }
    // Không có sale => dùng giá gốc
    return Number(item.Price) || 0;
  };

  // 3) Cập nhật số lượng
  const updateQuantity = async (productId, delta) => {
    // Cập nhật state cục bộ
    const updatedItems = cartItems.map((item) =>
      item.ProductID === productId
        ? { ...item, Quantity: Math.max(1, item.Quantity + delta) }
        : item
    );
    setCartItems(updatedItems);

    try {
      const newQty = updatedItems.find((i) => i.ProductID === productId)?.Quantity;
      // Gọi API cập nhật server
      await axios.put(
        `http://localhost:2000/api/v1/cart/${customerId}/${productId}`,
        { quantity: newQty }
      );
      
      if (onCartUpdated) onCartUpdated();
    } catch (error) {
      console.error("Lỗi khi cập nhật số lượng:", error);
    }
  };

  // 4) Cập nhật màu/size
  const updateColorOrSize = async (productId, newData) => {
    const updatedItems = cartItems.map((item) =>
      item.ProductID === productId ? { ...item, ...newData } : item
    );
    setCartItems(updatedItems);

    try {
      await axios.put(
        `http://localhost:2000/api/v1/cart/${customerId}/${productId}`,
        newData
      );
      if (onCartUpdated) onCartUpdated();
    } catch (error) {
      console.error("Lỗi khi cập nhật color/size:", error);
    }
  };

  // 5) Xoá sản phẩm
  const removeItem = async (productId) => {
    setCartItems((prev) => prev.filter((item) => item.ProductID !== productId));
    try {
      await axios.delete(
        `http://localhost:2000/api/v1/cart/${customerId}/${productId}`
      );
      if (onCartUpdated) onCartUpdated();
    } catch (error) {
      console.error("Lỗi khi xóa sản phẩm:", error);
    }
  };

  // Tính tổng tiền (dựa trên giá đã giảm nếu có)
  const subtotal = cartItems.reduce((sum, item) => {
    const priceNum = getItemPrice(item);
    // priceNum luôn là number => .toFixed ok
    return sum + priceNum * item.Quantity;
  }, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-lg h-[80vh] sm:h-[600px] p-6 rounded-lg shadow-lg relative flex flex-col">
        {/* Nút đóng */}
        <button className="absolute top-4 left-4 text-2xl" onClick={onClose}>
          <IoClose />
        </button>

        <h2 className="text-2xl font-semibold mb-4 text-center">Cart Review</h2>

        {cartItems.length === 0 ? (
          <p className="text-center text-gray-500 flex-grow flex items-center justify-center">
            Your cart is empty
          </p>
        ) : (
          <>
            {/* Danh sách sản phẩm */}
            <div className="flex-grow overflow-y-auto space-y-4 pr-2">
              {cartItems.map((item) => {
                const detail = productDetails[item.ProductID] || {};
                const colors = detail.colors || [];
                const sizes = detail.sizes || [];

                // Lấy giá (nếu sale => SalePrice)
                const priceNum = getItemPrice(item);

                return (
                  <div
                    key={item.ProductID}
                    className="flex items-center justify-between border-b pb-4"
                  >
                    <img
                      src={
                        item.ImageURL
                          ? `http://localhost:2000/image/${item.ImageURL.split(",")[0]}`
                          : "/images/default.jpg"
                      }
                      alt={item.Name}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                    <div className="flex-1 ml-4">
                      <h3 className="text-sm font-medium">{item.Name}</h3>

                      {/* Nếu có SalePrice => hiển thị giá gốc gạch */}
                      {detail.SalePrice > 0 && detail.SalePercent > 0 ? (
                        <>
                          <p className="text-xs line-through text-gray-400">
                            {Number(item.Price).toFixed(2)} đ
                          </p>
                          <p className="text-sm font-semibold text-red-500">
                            {priceNum.toFixed(2)} đ
                          </p>
                        </>
                      ) : (
                        <p className="text-sm font-semibold">
                          {Number(priceNum).toFixed(2)} đ
                        </p>
                      )}

                      {/* Chọn màu */}
                      {colors.length > 0 && (
                        <select
                          className="border p-1 rounded text-sm mt-1"
                          value={item.Color || ""}
                          onChange={(e) =>
                            updateColorOrSize(item.ProductID, { color: e.target.value })
                          }
                        >
                          {colors.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      )}

                      {/* Chọn size */}
                      {sizes.length > 0 && (
                        <select
                          className="border p-1 rounded text-sm mt-1 ml-2"
                          value={item.Size || ""}
                          onChange={(e) =>
                            updateColorOrSize(item.ProductID, { size: e.target.value })
                          }
                        >
                          {sizes.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      )}

                      <div className="flex items-center space-x-2 mt-2">
                        <button
                          className="p-2 border rounded"
                          onClick={() => updateQuantity(item.ProductID, -1)}
                        >
                          <FiMinus />
                        </button>
                        <span className="w-6 text-center">{item.Quantity}</span>
                        <button
                          className="p-2 border rounded"
                          onClick={() => updateQuantity(item.ProductID, 1)}
                        >
                          <FiPlus />
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <button
                        className="text-red-500 text-sm"
                        onClick={() => removeItem(item.ProductID)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Tổng tiền */}
            <div className="mt-6 border-t pt-4 flex justify-between text-lg font-medium">
              <span>Subtotal:</span>
              <span>{subtotal.toFixed(2)} đ</span>
            </div>

            <div className="flex justify-between mt-6">
              <button
                className="px-6 py-2 border rounded-lg text-gray-700 w-1/2 mr-2"
                onClick={() => navigate("/cart")}
              >
                Xem giỏ hàng
              </button>
              <button  onClick={() => navigate("/dat-hang")} className="px-6 py-2 bg-black text-white rounded-lg w-1/2 ml-2">
                Thanh toán
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}











