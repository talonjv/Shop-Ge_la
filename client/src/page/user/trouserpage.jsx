import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { AiOutlineEye } from "react-icons/ai";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../layout/navbar";
import Footer from "../../layout/footer";

const ITEMS_PER_PAGE = 12;

// Component hiển thị từng sản phẩm (có chức năng chuyển ảnh vòng lặp)
function ProductItem({ product, navigate, setPreviewImage, genderParam }) {
  let imageUrls = [];
  if (typeof product.ImageURL === "string") {
    imageUrls = product.ImageURL.split(",").map((img) => img.trim());
  } else if (Array.isArray(product.ImageURL)) {
    imageUrls = product.ImageURL;
  }

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseLeave = () => {
    setIsHovered(false);
    setCurrentImageIndex(0);
  };

  const displayedImage =
    imageUrls.length > 0 ? imageUrls[currentImageIndex] : "default.jpg";

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : imageUrls.length - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) =>
      prev < imageUrls.length - 1 ? prev + 1 : 0
    );
  };

  const hasSale =
    product.SalePercent &&
    product.SalePercent > 0 &&
    product.SalePrice &&
    product.SalePrice > 0;

  // Điều hướng sang trang chi tiết sản phẩm:
  // Nếu genderParam === "nam" => chuyển đến /do-nam/...
  // Nếu genderParam === "nu"  => chuyển đến /do-nu/...
  // Nếu không có => chuyển đến /trouser/...
  const goToDetailPage = () => {
    const slug = product.Name.toLowerCase().replace(/\s+/g, "-");
    const encodedId = btoa(product.ProductID.toString());
    let baseRoute = "/trouser";
    if (genderParam === "nam") {
      baseRoute = "/do-nam";
    } else if (genderParam === "nu") {
      baseRoute = "/do-nu";
    }
    navigate(`${baseRoute}/${slug}/${encodedId}`);
  };

  return (
    <div
      className="border p-3 rounded-lg relative group bg-white shadow-md"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{ minWidth: "260px" }}
    >
      {hasSale && (
        <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 text-sm font-bold rounded">
          -{product.SalePercent}%
        </div>
      )}

      <div
        onClick={goToDetailPage}
        className="relative w-full h-80 overflow-hidden cursor-pointer rounded-md"
      >
        <img
          className="w-full h-full object-cover"
          src={`http://localhost:2000/image/${displayedImage}`}
          alt={product.Name}
        />
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
          {product.Price ? product.Price.toLocaleString() + " đ" : "Giá không có"}
        </div>
      )}

      <button
        onClick={goToDetailPage}
        className="mt-4 px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-all"
      >
        Xem chi tiết sản phẩm
      </button>
    </div>
  );
}

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
    CategoryID: PropTypes.number,
  }).isRequired,
  navigate: PropTypes.func.isRequired,
  setPreviewImage: PropTypes.func.isRequired,
  genderParam: PropTypes.string,
};

export default function ProductPageTrouser() {
  // Lấy tham số genderParam từ URL: ví dụ /trouser/nam hoặc /trouser/nu
  const { genderParam } = useParams();
  const navigate = useNavigate();

  // Xác định selectedGender: nếu genderParam === "nam" => "male", nếu "nu" => "female", nếu không có => "all"
  let selectedGender = "all";
  if (genderParam === "nam") selectedGender = "male";
  if (genderParam === "nu") selectedGender = "female";

  // Tiêu đề trang dựa trên giới tính
  let headingText = "Sản phẩm Quần";
  if (selectedGender === "male") headingText = "Quần Nam";
  if (selectedGender === "female") headingText = "Quần Nữ";

  const [products, setProducts] = useState([]);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [priceSort, setPriceSort] = useState("");
  const [showPriceDropdown, setShowPriceDropdown] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [previewImage, setPreviewImage] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:2000/api/v1/products-with-sale", {
        params: { categoryID: 2 }, // categoryID=1 => Áo
      })
      .then((response) => {
        if (response.data && Array.isArray(response.data.data)) {
          setProducts(response.data.data);
        } else {
          console.error("❌ API trả về dữ liệu không hợp lệ:", response.data);
        }
      })
      .catch((error) =>
        console.error("Lỗi khi lấy dữ liệu sản phẩm:", error)
      );
  }, []);

  // Lọc sản phẩm theo các tiêu chí
  const filteredProducts = products.filter((product) => {
    const matchSize = selectedSize ? product.Size?.includes(selectedSize) : true;
    const matchColor = selectedColor
      ? product.Color?.toLowerCase() === selectedColor.toLowerCase()
      : true;
    const matchGender =
      selectedGender === "all"
        ? true
        : product.Gender &&
          product.Gender.trim().toLowerCase() === selectedGender.toLowerCase();
    return matchSize && matchColor && matchGender;
  });

  // Sắp xếp sản phẩm theo giá
  let sortedProducts = [...filteredProducts];
  if (priceSort === "asc") {
    sortedProducts.sort((a, b) => a.Price - b.Price);
  } else if (priceSort === "desc") {
    sortedProducts.sort((a, b) => b.Price - a.Price);
  }

  const totalPages = Math.ceil(sortedProducts.length / ITEMS_PER_PAGE);
  const displayedProducts = sortedProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <>
      <Navbar />
      <div className="flex flex-col md:flex-row p-4">
        {/* Bộ lọc */}
        <div className="w-full md:w-1/5 p-3 border rounded-lg shadow-md bg-white mb-4 md:mb-0 md:mr-4">
          <h2 className="text-xl font-bold">Bộ lọc</h2>
          {/* Sắp xếp theo giá */}
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

          {/* Kích thước */}
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

          {/* Màu sắc */}
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

        {/* Danh sách sản phẩm */}
        <div className="w-full md:w-4/5 p-4">
          <button
            onClick={() => navigate(-1)}
            className="flex mb-4 h-12 w-24 items-center justify-center bg-white border-none rounded-md tracking-wide transition-all duration-200 ease-linear shadow-md hover:shadow-xl hover:-translate-y-0.5"
          >
            <FaArrowLeft className="mr-2 ml-2 w-5 h-5 transition-all duration-400 ease-in hover:-translate-x-1" />
            <span>Back</span>
          </button>

          <h1 className="text-2xl font-bold">{headingText}</h1>
          <p className="text-gray-500">{sortedProducts.length} sản phẩm</p>

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
                    genderParam={genderParam} // truyền param từ URL cho ProductItem
                  />
                );
              })
            ) : (
              <p className="text-center text-gray-500">
                Không có sản phẩm nào phù hợp.
              </p>
            )}
          </div>

          <div className="flex justify-center mt-4">
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index + 1)}
                className={`mx-1 px-3 py-2 rounded-md ${
                  currentPage === index + 1 ? "bg-blue-500 text-white" : "bg-gray-300"
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

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

