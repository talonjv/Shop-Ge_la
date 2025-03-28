import { useState, useEffect } from "react";
import PropTypes from "prop-types"; // Để khai báo propTypes, nếu bạn muốn xoá cảnh báo ESLint
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/logo.jpg";
import { FaAngleDown, FaEye, FaArrowLeft, FaArrowRight } from "react-icons/fa";
import BannerSlider from "../components/slide";

// ======================
// Tạo component ProductCard
// ======================
const ProductCard = ({ item, sectionType, navigate, onViewImage }) => {
  // Lấy danh sách ảnh từ item.ImageURL
  let imageList = [];
  if (Array.isArray(item.ImageURL)) {
    imageList = item.ImageURL;
  } else if (typeof item.ImageURL === "string") {
    imageList = item.ImageURL.split(",").map((img) => img.trim());
  }

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Khi bỏ chuột, reset về ảnh ban đầu
  const handleMouseLeave = () => {
    setIsHovered(false);
    setCurrentImageIndex(0);
  };

  // Hàm chuyển ảnh sang bên trái với chế độ vòng lặp
  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) =>
      prev > 0 ? prev - 1 : imageList.length - 1
    );
  };

  // Hàm chuyển ảnh sang bên phải với chế độ vòng lặp
  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) =>
      prev < imageList.length - 1 ? prev + 1 : 0
    );
  };

  const displayedImage = imageList.length > 0 ? imageList[currentImageIndex] : "";

  return (
    <div
      className="card cursor-pointer transition-shadow duration-300"
      onClick={() => {
        const slug = item.Name.toLowerCase().replace(/\s+/g, "-");
        const encodedId = btoa(item.ProductID.toString());
        const path = item.SalePercent
          ? "discount"
          : item.Gender === "Female"
          ? "do-nu"
          : "do-nam";
        navigate(`/${path}/${slug}/${encodedId}`);
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      <div className="bg-white border rounded-lg shadow flex flex-col h-[400px] overflow-hidden">
        <div className="relative image-container overflow-hidden">
          <img
            className="w-full h-[230px] object-cover rounded-t-lg transition-transform duration-300"
            src={`http://localhost:2000/image/${displayedImage}`}
            alt={item.Name}
          />

          {/* Nút xem ảnh (FaEye) - gọi hàm mở modal từ cha */}
          <button
            className="absolute top-2 right-2 text-white bg-black bg-opacity-50 p-2 rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              if (onViewImage && displayedImage) {
                onViewImage(displayedImage);
              }
            }}
          >
            <FaEye />
          </button>

          {/* Hiển thị nút mũi tên khi hover và có nhiều hơn 1 ảnh */}
          {isHovered && imageList.length > 1 && (
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
        <div className="p-4 flex-1 flex flex-col justify-between">
          <div>
            <h5 className="text-xl font-semibold tracking-tight text-gray-900 mb-2">
              {item.Name}
            </h5>
            {item.SalePercent ? (
              <div className="mb-2">
                <span className="text-gray-500 line-through mr-2">
                  {item.Price} VND
                </span>
                <span className="text-red-600 font-bold">
                  {item.SalePrice ? item.SalePrice + " VND" : ""}
                </span>
              </div>
            ) : (
              <p className="text-gray-600 text-base mb-2">{item.Price} VND</p>
            )}
          </div>
          {sectionType === "featured" && (
            <p className="text-sm text-gray-500">Đã bán: {item.SalesCount}</p>
          )}
          {sectionType === "discount" && (
            <p className="text-sm text-green-600">Giảm: {item.SalePercent}%</p>
          )}
        </div>
      </div>
    </div>
  );
};

// (Tuỳ chọn) Khai báo propTypes để ESLint không cảnh báo thiếu props validation
ProductCard.propTypes = {
  item: PropTypes.shape({
    ProductID: PropTypes.number.isRequired,
    Name: PropTypes.string.isRequired,
    ImageURL: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string),
    ]),
    SalePercent: PropTypes.number,
    SalePrice: PropTypes.number,
    Price: PropTypes.number,
    Gender: PropTypes.string,
    SalesCount: PropTypes.number,
  }).isRequired,
  sectionType: PropTypes.string.isRequired,
  navigate: PropTypes.func.isRequired,
  onViewImage: PropTypes.func,
};

const Home = () => {
  const navigate = useNavigate();
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Modal xem ảnh
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImage, setModalImage] = useState("");

  // Dropdown chọn giới tính
  const [isOpen, setIsOpen] = useState(false);
  const [selectedGender, setSelectedGender] = useState("Nữ");

  // Map giới tính UI sang dữ liệu thật
  const GENDER_MAP = {
    Nam: "Male",
    Nữ: "Female",
  };

  // CSS chung cho hiệu ứng đổ bóng của card
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      .card {
        transition: box-shadow 0.3s ease;
      }
      .card:hover {
        box-shadow: 0 20px 30px rgba(0, 0, 0, 0.3);
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Gọi API lấy danh sách sản phẩm
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await axios.get("http://localhost:2000/api/v1/products-with-sale");
        const products = response.data?.data || [];
        setAllProducts(Array.isArray(products) ? products : []);
      } catch (err) {
        setError("Lỗi khi lấy dữ liệu sản phẩm");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Hàm mở modal xem ảnh (được truyền xuống ProductCard qua prop onViewImage)
  const handleViewImage = (imageUrl) => {
    setModalImage(`http://localhost:2000/image/${imageUrl}`);
    setShowImageModal(true);
  };

  // Toggle dropdown
  const toggleDropdown = () => setIsOpen(!isOpen);

  // Chọn giới tính
  const selectGender = (gender) => {
    setSelectedGender(gender);
    setIsOpen(false);
  };

  // Sản phẩm nổi bật theo giới tính (bán chạy)
  const featuredProducts = allProducts
    .filter((item) => item.Gender === GENDER_MAP[selectedGender])
    .sort((a, b) => b.SalesCount - a.SalesCount)
    .slice(0, 8);

  // Sản phẩm giảm giá (lấy 8 sản phẩm)
  const discountedProducts = allProducts
    .filter((item) => item.SalePercent)
    .slice(0, 8);

  // Sản phẩm mới (sắp xếp theo ProductID giảm dần)
  const newProducts = [...allProducts]
    .sort((a, b) => b.ProductID - a.ProductID)
    .slice(0, 8);

  return (
    <>
      {/* Logo */}
      {/* <img src={Logo} alt="Logo" className="w-[1200px] ml-[160px]" />
        {/* Banner Slide */}
      <BannerSlider /> 

      {/* Tiêu đề Hàng Mới Về */}
      <div className="text-center mt-10">
        <h1 className="text-[40px] font-bold">Hàng Mới Về</h1>
        <p className="mt-4 text-lg">Sản phẩm mới được cập nhật</p>
      </div>
      {/* Sản phẩm mới */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-5 mx-[150px]">
        {newProducts.map((item) => (
          <ProductCard
            key={item.ProductID}
            item={item}
            sectionType="new"
            navigate={navigate}
            onViewImage={handleViewImage}
          />
        ))}
      </div>

      {/* Sản phẩm bán chạy theo giới tính */}
      <h1 className="text-center mt-16 text-5xl">Các Sản Phẩm Bán Chạy</h1>
      <div className="flex justify-center mt-4">
        <div className="relative inline-block">
          <button
            onClick={toggleDropdown}
            className="flex items-center text-lg font-medium text-gray-800"
          >
            {selectedGender}
            <span className={`ml-2 transform transition-transform ${isOpen ? "rotate-180" : ""}`}>
              <FaAngleDown />
            </span>
          </button>
          {isOpen && (
            <div className="absolute z-10 mt-2 w-20 bg-white border rounded-lg shadow-lg">
              <button
                className={`w-full px-4 py-2 text-left hover:bg-gray-100 ${
                  selectedGender === "Nữ" ? "font-bold" : ""
                }`}
                onClick={() => selectGender("Nữ")}
              >
                Nữ
              </button>
              <button
                className={`w-full px-4 py-2 text-left hover:bg-gray-100 ${
                  selectedGender === "Nam" ? "font-bold" : ""
                }`}
                onClick={() => selectGender("Nam")}
              >
                Nam
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-5 mx-[150px]">
        {featuredProducts.map((item) => (
          <ProductCard
            key={item.ProductID}
            item={item}
            sectionType="featured"
            navigate={navigate}
            onViewImage={handleViewImage}
          />
        ))}
      </div>
      <div className="flex justify-center mt-6">
        <button
          className="w-[200px] border-red-300 border-solid border-2 rounded-lg p-3 hover:bg-red-300"
          onClick={() => navigate(selectedGender === "Nữ" ? "/do-nu" : "/do-nam")}
        >
          Xem Thêm
        </button>
      </div>

    

      {/* Phần Giảm giá */}
      {/* <div className="mt-4">
        <p className="text-center text-xl font-semibold">Giảm giá</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-5 mx-[150px]">
        {discountedProducts.map((item) => (
          <ProductCard
            key={item.ProductID}
            item={item}
            sectionType="discount"
            navigate={navigate}
            onViewImage={handleViewImage}
          />
        ))}
      </div>
      <div className="flex justify-center mt-6">
        <button
          className="w-[200px] border-red-300 border-solid border-2 rounded-lg p-3 hover:bg-red-300"
          onClick={() => navigate("/discount")}
        >
          Xem Thêm
        </button>
      </div> */}

      {/* Modal xem ảnh */}
      {showImageModal && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          onClick={() => setShowImageModal(false)}
        >
          <img src={modalImage} alt="Preview" className="w-[900px] h-[600px]" />
        </div>
      )}
    </>
  );
};

// (Tuỳ chọn) Nếu muốn khai báo propTypes cho Home, bạn có thể thêm vào đây
// Home.propTypes = { ... };

export default Home;












