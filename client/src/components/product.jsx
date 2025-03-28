import Navbar from "../layout/navbar";
import { useEffect, useState } from "react";
import axios from "axios";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../middleware/cartSlice";
import { toast, ToastContainer } from "react-toastify";
import { useParams, useNavigate } from "react-router-dom";

// Ví dụ dùng 3 icon
import { FaExchangeAlt, FaHeadset, FaCheckCircle } from "react-icons/fa";
import Footer from "../layout/footer";

// Component hiển thị 5 ngôi sao với hiệu ứng hover
function StarRating({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= (hover || value);
        return (
          <svg
            key={star}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange(star)}
            className={`w-6 h-6 cursor-pointer transition-colors ${
              isFilled ? "text-yellow-400" : "text-gray-300"
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.167c.969 0 1.371 1.24.588 1.81l-3.374 2.45a1 1 0 00-.364 1.118l1.286 3.967c.3.921-.755 1.688-1.54 1.118l-3.374-2.45a1 1 0 00-1.176 0l-3.374 2.45c-.785.57-1.84-.197-1.54-1.118l1.286-3.967a1 1 0 00-.364-1.118L2.049 9.394c-.783-.57-.38-1.81.588-1.81h4.167a1 1 0 00.95-.69l1.286-3.967z" />
          </svg>
        );
      })}
    </div>
  );
}

function decodeId(encodedId) {
  return atob(encodedId);
}

export default function ProductDetail() {
  const { slug, encodedId } = useParams();
  let realId = null;
  let decodeError = false;
  try {
    realId = decodeId(encodedId);
    console.log("slug =", slug, "encodedId =", encodedId, "realId =", realId);
  } catch (error) {
    console.error("Error decoding ID:", error);
    decodeError = true;
  }

  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);
  const customerId = user?.customerId;
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ------------------ PHẦN BÌNH LUẬN ------------------
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState({
    Rating: 5,
    Comment: "",
  });
  // State để quản lý review đang được sửa
  const [editingReview, setEditingReview] = useState(null);

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const commentsPerPage = 5;

  // Quản lý tab: "overview" | "readcomment" | "createcomment"
  const [activeTab, setActiveTab] = useState("overview");

  // Bản đồ màu
  const colorMapping = {
    trắng: "#FFFFFF",
    đen: "#000000",
    vàng: "#FFFF00",
    đỏ: "#FF0000",
    xanh: "#008000",
    xám: "#808080",
    "xanh dương": "#0000FF",
    cam: "#FFA500",
    tím: "#800080",
    hồng: "#FFC0CB",
    nâu : "#993300",
  };

  if (decodeError) {
    return <p>⚠️ Invalid product ID in URL</p>;
  }

  // Lấy danh sách bình luận của sản phẩm
  useEffect(() => {
    axios
      .get(`http://localhost:2000/api/v1/reviews/product/${realId}`)
      .then((res) => {
        setComments(res.data);
      })
      .catch((err) => {
        console.error("Lỗi khi lấy bình luận:", err);
      });
  }, [realId]);

  // API thêm bình luận mới
  const handleSubmitComment = (e) => {
    e.preventDefault();
    if (!customerId) {
      toast.warn("Vui lòng đăng nhập để bình luận!", { position: "top-left", autoClose: 3000 });
      return;
    }
    const payload = {
      ProductID: realId,
      CustomerID: customerId,
      Rating: newComment.Rating,
      Comment: newComment.Comment,
    };
    axios
      .post("http://localhost:2000/api/v1/reviews", payload)
      .then((res) => {
        setComments([...comments, res.data]);
        setNewComment({ Rating: 5, Comment: "" });
        setActiveTab("readcomment");
        toast.success("Thêm bình luận thành công!", { position: "top-left", autoClose: 3000 });
      })
      .catch((err) => {
        console.error("Lỗi khi gửi bình luận:", err);
      });
  };

  // API sửa bình luận: nếu thành công, cập nhật state comments để hiển thị dữ liệu mới
  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!customerId) {
      toast.warn("Vui lòng đăng nhập để sửa bình luận!", { position: "top-left", autoClose: 3000 });
      return;
    }
    const payload = {
      customerId: customerId,
      rating: editingReview.Rating,
      comment: editingReview.Comment,
    };
    axios
      .put(`http://localhost:2000/api/v1/reviews/${editingReview.reviewid}`, payload)
      .then((res) => {
        const updatedComments = comments.map((c) =>
          c.reviewid === editingReview.reviewid
            ? { ...c, rating: editingReview.Rating, comment: editingReview.Comment }
            : c
        );
        setComments(updatedComments);
        setEditingReview(null);
        toast.success("Sửa bình luận thành công!", { position: "top-left", autoClose: 3000 });
      })
      .catch((err) => {
        console.error("Lỗi khi sửa bình luận:", err);
        toast.error("Không sửa được bình luận", { position: "top-left", autoClose: 3000 });
      });
  };

  // API xóa bình luận: nếu thành công, cập nhật state comments
  const handleDeleteReview = (item) => {
    axios
      .delete(`http://localhost:2000/api/v1/reviews/${item.reviewid}`, {
        data: { customerId },
      })
      .then((res) => {
        const updatedComments = comments.filter((c) => c.reviewid !== item.reviewid);
        setComments(updatedComments);
        toast.success("Xóa review thành công!", { position: "top-left", autoClose: 3000 });
      })
      .catch((err) => {
        console.error("Lỗi khi xóa review:", err);
        toast.error("Không xóa được bình luận", { position: "top-left", autoClose: 3000 });
      });
  };

  // Lấy sản phẩm
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:2000/api/v1/products/${realId}`);
        if (!response.data || !response.data.success || !response.data.data) {
          throw new Error("Sản phẩm không tồn tại hoặc có lỗi từ server");
        }
        const data = response.data.data[0];
        console.log("Sản phẩm từ server =", data);
        setProduct(data);
        setSizes(data.Size ? data.Size.split(",").map((size) => size.trim()) : []);
        setColors(
          data.Color
            ? data.Color.split(",").map((color) => {
                const trimmedColor = color.trim().toLowerCase();
                return {
                  name: trimmedColor,
                  code: colorMapping[trimmedColor] || trimmedColor,
                };
              })
            : []
        );
      } catch (err) {
        setError(err.message || "Có lỗi xảy ra khi tải thông tin sản phẩm");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [realId]);

  if (loading) return <p>Đang tải sản phẩm...</p>;
  if (error || !product) return <p>⚠️ {error || "Không tìm thấy sản phẩm"}</p>;

  // Xử lý ảnh
  const imageUrls = product.ImageURL ? product.ImageURL.split(",").map((img) => img.trim()) : [];
  const mainImage = imageUrls.length > 0 ? imageUrls[selectedIndex] : "default.jpg";

  // Modal ảnh
  const openModal = (index) => {
    setModalIndex(index);
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
  };
  const prevImage = () => {
    setModalIndex((prev) => (prev > 0 ? prev - 1 : imageUrls.length - 1));
  };
  const nextImage = () => {
    setModalIndex((prev) => (prev < imageUrls.length - 1 ? prev + 1 : 0));
  };

  // Số lượng
  const handleQuantityChange = (newQuantity) => {
    setQuantity(Math.max(1, Math.min(newQuantity, product.Stock || 1)));
  };

  // Phân trang bình luận
  const indexOfLastComment = currentPage * commentsPerPage;
  const indexOfFirstComment = indexOfLastComment - commentsPerPage;
  const currentComments = comments.slice(indexOfFirstComment, indexOfLastComment);

  // Thêm vào giỏ hàng
  const handleAddToCart = async () => {
    if (!product || !customerId) {
      toast.warn("Vui lòng Đăng Nhập trước khi thêm vào giỏ hàng!", { position: "top-left", autoClose: 3000 });
      return;
    }
    if (!selectedSize || !selectedColor) {
      toast.warn("Vui lòng chọn màu sắc và kích thước!", { position: "top-left", autoClose: 3000 });
      return;
    }
    try {
      dispatch(
        addToCart({
          productId: product.ProductID,
          name: product.Name,
          price: product.Price,
          quantity,
          color: selectedColor?.name,
          size: selectedSize,
          imageURL: imageUrls[0],
        })
      );
      const response = await axios.post("http://localhost:2000/api/v1/add-to-cart", {
        customerId,
        productId: product.ProductID,
        quantity,
        color: selectedColor?.name,
        size: selectedSize,
      });
      toast.success(response.data.message, { position: "top-left", autoClose: 3000 });
    } catch (error) {
      console.error("Lỗi khi thêm vào giỏ hàng:", error.response?.data || error.message);
      toast.warn("Sản phẩm đã hết vui lòng chọn sản phẩm khác", { position: "top-left", autoClose: 3000 });
    }
  };

  // Kiểm tra sale
  const hasSale =
    product.SalePercent !== null &&
    product.SalePercent > 0 &&
    product.SalePrice !== null &&
    product.SalePrice > 0;

  return (
    <>
      <Navbar />
      <button
        onClick={() => navigate(-1)}
        className="flex h-12 w-24 ml-[150px] items-center justify-center bg-white border-none rounded-md tracking-wide transition-all duration-200 ease-linear shadow-md hover:shadow-xl hover:-translate-y-0.5"
      >
        <svg
          className="mr-2 ml-2 w-5 h-5 transition-all duration-400 ease-in hover:-translate-x-1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1024 1024"
          fill="currentColor"
        >
          <path d="M874.690416 495.52477c0 11.2973-9.168824 20.466124-20.466124 20.466124l-604.773963 0 188.083679 188.083679c7.992021 7.992021 7.992021 20.947078 0 28.939099-4.001127 3.990894-9.240455 5.996574-14.46955 5.996574-5.239328 0-10.478655-1.995447-14.479783-5.996574l-223.00912-223.00912c-3.837398-3.837398-5.996574-9.046027-5.996574-14.46955 0-5.433756 2.159176-10.632151 5.996574-14.46955l223.019353-223.029586c7.992021-7.992021 20.957311-7.992021 28.949332 0 7.992021 8.002254 7.992021 20.957311 0 28.949332l-188.073446 188.073446 604.753497 0C865.521592 475.058646 874.690416 484.217237 874.690416 495.52477z"></path>
        </svg>
        <span>Back</span>
      </button>

      {/* Thông tin sản phẩm + ảnh */}
      <div className="max-w-6xl mx-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Cột trái: Ảnh sản phẩm */}
        <div>
          <div className="flex gap-4">
            {/* Thumbnails */}
            <div className="w-1/6 flex flex-col gap-2 overflow-y-auto max-h-[500px]">
              {imageUrls.map((url, index) => (
                <img
                  key={url}
                  src={`http://localhost:2000/image/${url}`}
                  alt={`Ảnh ${index + 1}`}
                  className={`w-full h-20 object-cover rounded cursor-pointer border-2 ${
                    index === selectedIndex ? "border-blue-500" : "border-transparent"
                  }`}
                  onClick={() => setSelectedIndex(index)}
                />
              ))}
            </div>
            {/* Ảnh chính */}
            <div className="w-5/6">
              <img
                src={`http://localhost:2000/image/${mainImage}`}
                alt="Main Product"
                className="w-full h-auto rounded-lg object-cover cursor-pointer scale-105 transition-transform duration-300"
                onClick={() => openModal(selectedIndex)}
              />
            </div>
          </div>
        </div>

        {/* Cột phải: Thông tin sản phẩm */}
        <div className="space-y-4">
          <h1 className="text-2xl font-bold">{product.Name}</h1>
          {hasSale ? (
            <div className="space-y-1">
              <p className="text-xl text-gray-500 line-through">{product.Price.toLocaleString()} đ</p>
              <p className="text-2xl font-bold text-red-600">{product.SalePrice.toLocaleString()} đ</p>
              <span className="inline-block bg-red-500 text-white px-2 py-1 text-sm rounded">
                -{product.SalePercent}%
              </span>
            </div>
          ) : (
            <p className="text-red-600 font-semibold text-xl">{product.Price.toLocaleString()} đ</p>
          )}
          <p className={`font-medium ${product.Stock > 0 ? "text-green-600" : "text-red-600"}`}>
            {product.Stock > 0 ? "• Còn hàng" : "• Hết hàng"}
          </p>

          {/* Chọn Size */}
          {sizes.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Size</h3>
              <div className="flex gap-2">
                {sizes.map((size, index) => (
                  <button
                    key={`${size}-${index}`}
                    className={`px-4 py-2 border rounded-full ${
                      selectedSize === size ? "bg-blue-600 text-white" : "bg-gray-200"
                    }`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chọn Màu */}
          {colors.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Màu sắc</h3>
              <div className="flex gap-3">
                {colors.map((color, index) => (
                  <div
                    key={`${color.name}-${index}`}
                    className={`w-10 h-10 rounded-full border-2 cursor-pointer flex items-center justify-center text-xs text-white shadow ${
                      selectedColor?.name === color.name ? "border-blue-600" : "border-transparent"
                    }`}
                    style={{ backgroundColor: color.code }}
                    onClick={() => setSelectedColor(color)}
                  >
                    {color.code === "transparent" && color.name}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Chọn số lượng */}
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold">Số lượng</h3>
            <div className="flex items-center border rounded px-2">
              <button className="px-3 py-1 text-lg" onClick={() => handleQuantityChange(quantity - 1)}>-</button>
              <span className="px-4">{quantity}</span>
              <button className="px-3 py-1 text-lg" onClick={() => handleQuantityChange(quantity + 1)}>+</button>
            </div>
          </div>

          {/* Nút thêm vào giỏ hàng */}
          <button
            onClick={handleAddToCart}
            className="w-full md:w-auto px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
          >
            Thêm vào giỏ hàng
            <ToastContainer />
          </button>
        </div>
      </div>

      {/* Modal xem ảnh */}
      {isModalOpen && (
        <div className="fixed z-50 inset-0 bg-black bg-opacity-80 flex items-center justify-center" onClick={closeModal}>
          <div className="relative max-w-4xl w-full p-4 rounded-lg" onClick={(e) => e.stopPropagation()}>
            <button className="absolute top-2 right-2 p-2 rounded-full hover:bg-gray-300" onClick={closeModal}>❌</button>
            <button className="absolute left-[-60px] top-1/2 transform -translate-y-1/2 p-2 rounded-full hover:bg-gray-300" onClick={prevImage}>
              <FaAngleLeft size={50} />
            </button>
            <img
              src={`http://localhost:2000/image/${imageUrls[modalIndex]}`}
              alt="Product"
              className="w-full h-auto rounded-lg object-cover"
            />
            <button className="absolute right-[-60px] top-1/2 transform -translate-y-1/2 p-2 rounded-full hover:bg-gray-300" onClick={nextImage}>
              <FaAngleRight size={50} />
            </button>
            <div className="flex gap-2 mt-4 justify-center">
              {imageUrls.map((url, index) => (
                <img
                  key={index}
                  src={`http://localhost:2000/image/${url}`}
                  alt={`Ảnh ${index + 1}`}
                  className={`w-16 h-16 object-cover rounded cursor-pointer border-2 ${index === modalIndex ? "border-blue-500" : "border-transparent"}`}
                  onClick={() => setModalIndex(index)}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bọc toàn bộ 3 tab trong div full-width, background màu xám nhạt */}
      <div className="w-full bg-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Thanh tab */}
          <ul className="flex justify-center gap-8 border-b border-gray-300 mb-6">
            <li className={`pb-2 cursor-pointer ${activeTab === "overview" ? "border-b-2 border-black font-semibold" : "text-gray-500"}`} onClick={() => setActiveTab("overview")}>
              Tổng quan sản phẩm
            </li>
            <li className={`pb-2 cursor-pointer ${activeTab === "readcomment" ? "border-b-2 border-black font-semibold" : "text-gray-500"}`} onClick={() => setActiveTab("readcomment")}>
              Xem bình luận
            </li>
            <li className={`pb-2 cursor-pointer ${activeTab === "createcomment" ? "border-b-2 border-black font-semibold" : "text-gray-500"}`} onClick={() => setActiveTab("createcomment")}>
              Viết bình luận
            </li>
          </ul>

          {/* Nội dung tab */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-2">Specifications:</h3>
                <p className="text-gray-600">
                  {product.Description || "Đây là khu vực hiển thị thông tin chi tiết về sản phẩm, như chất liệu, kiểu dáng..."}
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Care & Maintenance:</h3>
                <p className="text-gray-600">Hướng dẫn bảo quản, giặt ủi, v.v...</p>
              </div>
              <div className="md:col-span-2 flex flex-col md:flex-row justify-between items-center mt-8 gap-6">
                <div className="flex flex-col items-center">
                  <FaExchangeAlt className="text-3xl mb-2 text-gray-700" />
                  <p className="font-medium">Easy Returns</p>
                </div>
                <div className="flex flex-col items-center">
                  <FaHeadset className="text-3xl mb-2 text-gray-700" />
                  <p className="font-medium">Quality Service</p>
                </div>
                <div className="flex flex-col items-center">
                  <FaCheckCircle className="text-3xl mb-2 text-gray-700" />
                  <p className="font-medium">Original Product</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "readcomment" && (
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-4">Xem bình luận</h2>
              {comments.length > 0 ? (
                <>
                  {currentComments.map((item, index) => (
                    <div key={`${item.reviewid}-${index}`} className="border-b py-2">
                      {editingReview && editingReview.reviewid === item.reviewid ? (
                        // Form sửa bình luận
                        <form onSubmit={handleEditSubmit} className="space-y-2">
                          <div className="flex items-center gap-2">
                            <StarRating
                              value={editingReview.Rating}
                              onChange={(star) => setEditingReview({ ...editingReview, Rating: star })}
                            />
                            <textarea
                              value={editingReview.Comment}
                              onChange={(e) => setEditingReview({ ...editingReview, Comment: e.target.value })}
                              className="w-full p-2 border rounded"
                              rows="2"
                            />
                          </div>
                          <div className="flex gap-4">
                            <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded">
                              Lưu
                            </button>
                            <button type="button" onClick={() => setEditingReview(null)} className="px-4 py-2 bg-gray-400 text-white rounded">
                              Hủy
                            </button>
                          </div>
                        </form>
                      ) : (
                        // Hiển thị bình luận cùng nút Sửa & Xóa
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <img
                                src={`http://localhost:2000/image/${item.customeravatar}`}
                                alt="Avatar"
                                className="w-8 h-8 rounded-full object-cover"
                              />
                              <span className="font-medium">{item.customername}</span>
                            </div>
                            <p className="font-medium">Rating: {item.rating} ⭐</p>
                            <p>{item.comment}</p>
                          </div>
                          {customerId === item.customerid && (
                            <div className="flex flex-col gap-2">
                              <button
                                onClick={() =>
                                  setEditingReview({
                                    reviewid: item.reviewid,
                                    Rating: item.rating,
                                    Comment: item.comment,
                                    customerid: item.customerid,
                                  })
                                }
                                className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-600 font-semibold rounded-md shadow-sm hover:bg-blue-100 hover:text-blue-700"
                              >
                                Sửa
                              </button>
                              <button
                                onClick={() => handleDeleteReview(item)}
                                className="inline-flex items-center px-4 py-2 bg-red-50 text-red-600 font-semibold rounded-md shadow-sm hover:bg-red-100 hover:text-red-700"
                              >
                                Xóa
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  <div className="flex justify-center gap-4 mt-4">
                    <button
                      className="px-4 py-2 bg-gray-300 rounded disabled:bg-gray-100"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((prev) => prev - 1)}
                    >
                      Trang trước
                    </button>
                    <button
                      className="px-4 py-2 bg-gray-300 rounded disabled:bg-gray-100"
                      disabled={indexOfLastComment >= comments.length}
                      onClick={() => setCurrentPage((prev) => prev + 1)}
                    >
                      Trang sau
                    </button>
                  </div>
                </>
              ) : (
                <p className="text-gray-500">Chưa có bình luận nào.</p>
              )}
            </div>
          )}

          {activeTab === "createcomment" && (
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-4">Viết bình luận</h2>
              <form onSubmit={handleSubmitComment} className="space-y-4">
                <div>
                  <label className="block font-medium">Đánh giá (1-5):</label>
                  <StarRating
                    value={newComment.Rating}
                    onChange={(star) => setNewComment({ ...newComment, Rating: star })}
                  />
                </div>
                <div>
                  <label className="block font-medium">Bình luận:</label>
                  <textarea
                    value={newComment.Comment}
                    onChange={(e) => setNewComment({ ...newComment, Comment: e.target.value })}
                    className="w-full p-2 border rounded"
                    rows="3"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="group relative flex items-center justify-center gap-2 bg-blue-500 text-white w-[120px] h-10 rounded-full transition-all duration-300 overflow-hidden"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5 flex-shrink-0 transition-all duration-600 group-hover:rotate-[50deg] group-hover:translate-x-1"
                  >
                    <path fill="none" d="M0 0h24v24H0z" />
                    <path d="M1.946 9.315c-.522-.174-.527-.455.01-.634l19.087-6.362c.529-.176.832.12.684.638l-5.454 19.086c-.15.529-.455.547-.679.045L12 14l6-8-8 6-8.054-2.685z" />
                  </svg>
                  <span className="transition-all duration-300 group-hover:w-0 group-hover:opacity-0 group-hover:translate-x-2 overflow-hidden">
                    Gửi
                  </span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
      <ToastContainer />
      <Footer/>
    </>
  );
}



















