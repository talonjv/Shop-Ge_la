import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { AiOutlineEye } from "react-icons/ai";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import Navbar from "../../layout/navbar";
import { useNavigate } from "react-router-dom";
import Footer from "../../layout/footer";

const ITEMS_PER_PAGE = 12;

// Component hiển thị từng sản phẩm (có chức năng chuyển ảnh vòng lặp)
function ProductItem({ product, navigate, setPreviewImage }) {
  // Lấy danh sách ảnh
  let imageUrls = [];
  if (typeof product.ImageURL === "string") {
    imageUrls = product.ImageURL.split(",").map((img) => img.trim());
  } else if (Array.isArray(product.ImageURL)) {
    imageUrls = product.ImageURL;
  }

  // Dùng state để lưu chỉ số ảnh hiện tại
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  // Dùng state để quản lý hover
  const [isHovered, setIsHovered] = useState(false);

  // Khi di chuột ra khỏi sản phẩm, reset ảnh về ảnh đầu
  const handleMouseLeave = () => {
    setIsHovered(false);
    setCurrentImageIndex(0);
  };

  // Ảnh đang hiển thị
  const displayedImage =
    imageUrls.length > 0 ? imageUrls[currentImageIndex] : "default.jpg";

  // Chuyển ảnh trước (có vòng lặp)
  const handlePrev = (e) => {
    e.stopPropagation(); // tránh trùng sự kiện click vào card
    setCurrentImageIndex((prev) =>
      prev > 0 ? prev - 1 : imageUrls.length - 1
    );
  };

  // Chuyển ảnh sau (có vòng lặp)
  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) =>
      prev < imageUrls.length - 1 ? prev + 1 : 0
    );
  };

  // Kiểm tra có sale
  const hasSale =
    product.SalePercent &&
    product.SalePercent > 0 &&
    product.SalePrice &&
    product.SalePrice > 0;

  // Điều hướng sang trang chi tiết khi click vào ảnh
  const goToDetailPage = () => {
    const slug = product.Name.toLowerCase().replace(/\s+/g, "-");
    const encodedId = btoa(product.ProductID.toString());
    // Tạm dùng "/do-nu" để demo, bạn có thể đổi lại "/do-nam" nếu muốn
    navigate(`/do-nu/${slug}/${encodedId}`);
  };

  return (
    <div
      className="border p-3 rounded-lg relative group bg-white shadow-md"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{ minWidth: "260px" }} // Card to hơn
    >
      {/* Badge hiển thị % sale nếu có */}
      {hasSale && (
        <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 text-sm font-bold rounded">
          -{product.SalePercent}%
        </div>
      )}

      {/* Vùng hiển thị ảnh */}
      <div
        onClick={goToDetailPage}
        className="relative w-full h-80 overflow-hidden cursor-pointer rounded-md"
      >
        <img
          className="w-full h-full object-cover"
          src={`http://localhost:2000/image/${displayedImage}`}
          alt={product.Name}
        />
        {/* Nút xem ảnh (phóng to modal) chỉ hiển thị khi hover */}
        {isHovered && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setPreviewImage(`http://localhost:2000/image/${displayedImage}`);
            }}
            className="absolute top-2 left-2 bg-black bg-opacity-50 p-2 rounded-full text-white"
          >
            <AiOutlineEye size={24} />
          </button>
        )}

        {/* Nút mũi tên trái/phải chỉ hiển thị khi hover và có nhiều hơn 1 ảnh */}
        {isHovered && imageUrls.length > 1 && (
          <>
            <button
              className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full"
              onClick={handlePrev}
            >
              <FaArrowLeft />
            </button>
            <button
              className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full"
              onClick={handleNext}
            >
              <FaArrowRight />
            </button>
          </>
        )}
      </div>

      {/* Thông tin sản phẩm */}
      <h3 className="text-base font-semibold mt-2">{product.Name}</h3>
      {hasSale ? (
        <div className="mt-1">
          <span className="line-through text-gray-500 mr-2">
            {product.Price?.toLocaleString()} đ
          </span>
          <span className="text-red-600 font-bold">
            {product.SalePrice?.toLocaleString()} đ
          </span>
        </div>
      ) : (
        <div className="text-base font-bold mt-1">
          {product.Price
            ? product.Price.toLocaleString() + " đ"
            : "Giá không có"}
        </div>
      )}

      {/* Nút Xem chi tiết sản phẩm */}
      <button
        onClick={goToDetailPage}
        className="mt-4 px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-all"
      >
        Xem chi tiết sản phẩm
      </button>
    </div>
  );
}

// Khai báo propTypes để ESLint không cảnh báo
ProductItem.propTypes = {
  product: PropTypes.shape({
    ProductID: PropTypes.number,
    Name: PropTypes.string,
    ImageURL: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
    SalePercent: PropTypes.number,
    SalePrice: PropTypes.number,
    Price: PropTypes.number,
    Size: PropTypes.string,
    Color: PropTypes.string,
    Gender: PropTypes.string,
  }).isRequired,
  navigate: PropTypes.func.isRequired,
  setPreviewImage: PropTypes.func.isRequired,
};

export default function ProductPageMale() {
  const [products, setProducts] = useState([]);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [priceSort, setPriceSort] = useState(""); // "asc" hoặc "desc"
  const [showPriceDropdown, setShowPriceDropdown] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [previewImage, setPreviewImage] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    // Gọi API /products-with-sale (JOIN bảng salereport)
    axios
      .get("http://localhost:2000/api/v1/products-with-sale")
      .then((response) => {
        if (response.data && Array.isArray(response.data.data)) {
          // Lọc ra sản phẩm Nam
          const maleProducts = response.data.data.filter(
            (product) => product.Gender?.toLowerCase() === "male"
          );
          setProducts(maleProducts);
        } else {
          console.error("❌ API trả về dữ liệu không hợp lệ:", response.data);
        }
      })
      .catch((error) =>
        console.error(" Lỗi khi lấy dữ liệu sản phẩm:", error)
      );
  }, []);

  // Lọc sản phẩm theo kích thước và màu sắc
  const filteredProducts = products.filter((product) => {
    const matchSize = selectedSize ? product.Size?.includes(selectedSize) : true;
    const matchColor = selectedColor
      ? product.Color?.toLowerCase() === selectedColor.toLowerCase()
      : true;
    return matchSize && matchColor;
  });

  // Sắp xếp theo giá nếu có lựa chọn
  let sortedProducts = [...filteredProducts];
  if (priceSort === "asc") {
    sortedProducts.sort((a, b) => a.Price - b.Price);
  } else if (priceSort === "desc") {
    sortedProducts.sort((a, b) => b.Price - a.Price);
  }

  // Phân trang
  const totalPages = Math.ceil(sortedProducts.length / ITEMS_PER_PAGE);
  const displayedProducts = sortedProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <>
      <Navbar />
      <div className="flex flex-col md:flex-row p-4">
        {/* Cột trái: Bộ lọc (nhỏ lại một chút) */}
        <div className="w-full md:w-1/5 p-3 border rounded-lg shadow-md bg-white mb-4 md:mb-0 md:mr-4">
          <h2 className="text-xl font-bold">Bộ lọc</h2>

          {/* Bộ lọc theo giá */}
          <div className="mt-4">
            <label className="font-semibold">Sắp xếp theo giá</label>
            <div className="relative">
              <button
                onClick={() => setShowPriceDropdown(!showPriceDropdown)}
                className="w-full p-1 border rounded-md text-left"
              >
                {priceSort === "asc"
                  ? "Giá tăng dần"
                  : priceSort === "desc"
                  ? "Giá giảm dần"
                  : "Chọn sắp xếp"}
              </button>
              {showPriceDropdown && (
                <div className="absolute bg-white border rounded-md shadow mt-1 w-full z-10">
                  <div
                    onClick={() => {
                      setPriceSort("asc");
                      setShowPriceDropdown(false);
                      setCurrentPage(1);
                    }}
                    className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                  >
                    Giá tăng dần
                  </div>
                  <div
                    onClick={() => {
                      setPriceSort("desc");
                      setShowPriceDropdown(false);
                      setCurrentPage(1);
                    }}
                    className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                  >
                    Giá giảm dần
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bộ lọc theo kích thước */}
          <div className="mt-4">
            <label className="font-semibold">Kích thước</label>
            <select
              value={selectedSize}
              onChange={(e) => {
                setSelectedSize(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full p-1 border rounded-md"
            >
              <option value="">Tất cả</option>
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
              <option value="XL">XL</option>
            </select>
          </div>

          {/* Bộ lọc theo màu sắc */}
          <div className="mt-4">
            <label className="font-semibold">Màu sắc</label>
            <select
              value={selectedColor}
              onChange={(e) => {
                setSelectedColor(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full p-1 border rounded-md"
            >
              <option value="">Tất cả</option>
              <option value="Đỏ">Đỏ</option>
              <option value="Xanh">Xanh</option>
              <option value="Vàng">Vàng</option>
              <option value="Đen">Đen</option>
              <option value="Trắng">Trắng</option>
            </select>
          </div>
        </div>

        {/* Cột phải: Danh sách sản phẩm */}
        <div className="w-full md:w-4/5 p-4">
          {/* Nút Back */}
          <button
            onClick={() => navigate(-1)}
            className="flex mb-4 h-12 w-24 items-center justify-center bg-white border-none rounded-md tracking-wide transition-all duration-200 ease-linear shadow-md hover:shadow-xl hover:-translate-y-0.5"
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

          <h1 className="text-2xl font-bold">Sản phẩm Nam</h1>
          <p className="text-gray-500">{sortedProducts.length} sản phẩm</p>

          {/* Grid sản phẩm - responsive */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4">
            {displayedProducts.length > 0 ? (
              displayedProducts.map((product) => {
                if (!product.ProductID) {
                  console.warn("⚠️ Sản phẩm không có ProductID:", product);
                  return null;
                }
                return (
                  <ProductItem
                    key={product.ProductID}
                    product={product}
                    navigate={navigate}
                    setPreviewImage={setPreviewImage}
                  />
                );
              })
            ) : (
              <p className="text-center text-gray-500">
                Không có sản phẩm nào phù hợp.
              </p>
            )}
          </div>

          {/* Nút phân trang */}
          <div className="flex justify-center mt-4">
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index + 1)}
                className={`mx-1 px-3 py-2 rounded-md ${
                  currentPage === index + 1
                    ? "bg-blue-500 text-white"
                    : "bg-gray-300"
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Modal xem ảnh phóng to */}
      {previewImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
          <div className="relative">
            <button
              onClick={() => setPreviewImage("")}
              className="absolute top-2 right-2 bg-white p-2 rounded-full"
            >
              ❌
            </button>
            <img
              src={previewImage}
              alt="Preview"
              className="max-w-full max-h-screen rounded-lg"
            />
          </div>
        </div>
      )}
      <Footer/>
    </>
  );
}




















