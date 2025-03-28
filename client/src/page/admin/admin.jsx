import { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";
import CustomerList from "./customerlist";
import OrdersPage from "./manageOder";
import SettingsPage from "./settingpage";

const ITEMS_PER_PAGE = 20; // Số sản phẩm trên mỗi trang

const Dashboard = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  // Bộ lọc theo danh mục và giới tính
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterGender, setFilterGender] = useState("all");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // State phân trang cho sản phẩm
  const [currentPage, setCurrentPage] = useState(1);

  // Modal Sale (phần cũ)
  const [saleModalOpen, setSaleModalOpen] = useState(false);
  const [saleFormData, setSaleFormData] = useState({
    salePercent: 0,
    salePrice: 0,
    saleStart: "",
    saleEnd: "",
  });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isUpdatingSale, setIsUpdatingSale] = useState(false);

  // Modal chi tiết sản phẩm
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedDetailProduct, setSelectedDetailProduct] = useState(null);

  const navigate = useNavigate();

  // Lấy danh sách sản phẩm khi activeSection là "products"
  useEffect(() => {
    if (activeSection === "products") {
      axios
        .get("http://localhost:2000/api/v1/products-with-sale")
        .then((response) => {
          setProducts(response.data.data);
          setCurrentPage(1); // Reset trang khi load lại sản phẩm
        })
        .catch((error) => console.error("Lỗi khi tải sản phẩm:", error));
    }
  }, [activeSection]);

  // Xóa sản phẩm
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này không?")) return;
    try {
      await axios.delete(`http://localhost:2000/api/v1/productcartdetail/${id}`);
      setProducts(products.filter((p) => p.ProductID !== id));
    } catch (error) {
      console.error("Lỗi khi xóa sản phẩm:", error);
    }
  };

  // Mở modal chi tiết sản phẩm
  const handleOpenDetailModal = (product) => {
    setSelectedDetailProduct(product);
    setDetailModalOpen(true);
  };

  // Các hàm mở/đóng modal Sale (đã có code cũ)
  const handleOpenCreateSaleModal = (product) => {
    setSelectedProduct(product);
    setIsUpdatingSale(false);
    setSaleFormData({
      salePercent: 0,
      salePrice: product.Price,
      saleStart: "",
      saleEnd: "",
    });
    setSaleModalOpen(true);
  };

  const handleOpenEditSaleModal = async (product) => {
    setSelectedProduct(product);
    setIsUpdatingSale(true);
    try {
      const res = await axios.get(`http://localhost:2000/api/v1/salesreports/${product.ProductID}`);
      if (res.data && res.data.sale) {
        const s = res.data.sale;
        setSaleFormData({
          salePercent: s.SalePercent || 0,
          salePrice: s.SalePrice || product.Price,
          saleStart: s.SaleStart ? s.SaleStart.substring(0, 10) : "",
          saleEnd: s.SaleEnd ? s.SaleEnd.substring(0, 10) : "",
        });
      } else {
        setIsUpdatingSale(false);
        setSaleFormData({
          salePercent: 0,
          salePrice: product.Price,
          saleStart: "",
          saleEnd: "",
        });
      }
    } catch (error) {
      setIsUpdatingSale(false);
      setSaleFormData({
        salePercent: 0,
        salePrice: product.Price,
        saleStart: "",
        saleEnd: "",
      });
    }
    setSaleModalOpen(true);
  };

  const handleCloseSaleModal = () => {
    setSaleModalOpen(false);
    setSelectedProduct(null);
    setIsUpdatingSale(false);
    setSaleFormData({ salePercent: 0, salePrice: 0, saleStart: "", saleEnd: "" });
  };

  const handleSaleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;
    try {
      if (!isUpdatingSale) {
        await axios.post("http://localhost:2000/api/v1/createsales", {
          productID: selectedProduct.ProductID,
          salePercent: saleFormData.salePercent,
          salePrice: saleFormData.salePrice,
          saleStart: saleFormData.saleStart || null,
          saleEnd: saleFormData.saleEnd || null,
        });
        alert("Tạo sale thành công!");
      } else {
        await axios.put(`http://localhost:2000/api/v1/salesreports/${selectedProduct.ProductID}`, {
          salePercent: saleFormData.salePercent,
          salePrice: saleFormData.salePrice,
          saleStart: saleFormData.saleStart || null,
          saleEnd: saleFormData.saleEnd || null,
        });
        alert("Cập nhật sale thành công!");
      }
      handleCloseSaleModal();
    } catch (error) {
      console.error("Lỗi khi tạo/cập nhật sale:", error);
      alert("Có lỗi xảy ra, vui lòng kiểm tra console!");
    }
  };

  const handleDeleteSale = async (productID) => {
    if (!window.confirm("Bạn có chắc muốn xóa sale của sản phẩm này không?")) return;
    try {
      await axios.delete(`http://localhost:2000/api/v1/salesreports/${productID}`);
      alert("Đã xóa sale thành công!");
    } catch (error) {
      console.error("Lỗi khi xóa sale:", error);
      alert("Xóa sale thất bại!");
    }
  };

  const handleSaleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "salePercent") {
      const percent = parseFloat(value) || 0;
      const originalPrice = selectedProduct ? selectedProduct.Price : 0;
      const newPrice = originalPrice * (1 - percent / 100);
      setSaleFormData({
        ...saleFormData,
        salePercent: percent,
        salePrice: Math.floor(newPrice),
      });
    } else {
      setSaleFormData({ ...saleFormData, [name]: value });
    }
  };
  
  // Bộ lọc sản phẩm: tìm kiếm theo tên/miêu tả, danh mục và giới tính
  const filteredProducts = products
    .filter(
      (p) =>
        p.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.Description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((p) => {
      if (filterCategory === "all") return true;
      if (filterCategory === "áo") return p.CategoryID === 1;
      if (filterCategory === "quần") return p.CategoryID === 2;
      return true;
    })
    .filter((p) => {
      if (filterGender === "all") return true;
      // Hỗ trợ cả hai trường "Gender" và "gender"
      const gender = (p.Gender || p.gender || "").trim().toLowerCase();
      return gender === filterGender;
    });

  // Phân trang: tính tổng số trang và lấy danh sách sản phẩm hiển thị theo trang hiện tại
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const displayedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Khi thay đổi bộ lọc hoặc tìm kiếm, reset lại trang hiện tại về 1
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterCategory, filterGender]);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Sidebar */}
      <div
        className={`
          fixed top-0 left-0 bg-gray-800 text-white p-6 
          h-screen transform transition-transform duration-300 z-50
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:w-1/7
        `}
      >
        <div className="flex items-center justify-between mb-6 lg:hidden">
          <h2 className="text-2xl font-semibold">Danh mục</h2>
          <button onClick={() => setSidebarOpen(false)}>
            <FaTimes className="w-6 h-6" />
          </button>
        </div>
        <h2 className="text-2xl font-semibold mb-6 hidden lg:block">Danh mục</h2>
        <ul>
          <li
  className={`mb-4 hover:text-gray-300 cursor-pointer ${
    activeSection === "dashboard" ? "border-b-2 border-pink-500" : ""
  }`}
  onClick={() => {
    setActiveSection("dashboard");
    setSidebarOpen(false);
  }}
>
  Tổng quan
</li>
          <li
  className={`mb-4 hover:text-gray-300 cursor-pointer ${
    activeSection === "orders" ? "border-b-2 border-pink-500" : ""
  }`}
  onClick={() => {
    setActiveSection("orders");
    setSidebarOpen(false);
  }}
>
  Đơn hàng
</li>
          <li
  className={`mb-4 hover:text-gray-300 cursor-pointer ${
    activeSection === "customers" ? "border-b-2 border-pink-500" : ""
  }`}
  onClick={() => {
    setActiveSection("customers");
    setSidebarOpen(false);
  }}
>
  Khách hàng
</li>
         <li
  className={`mb-4 hover:text-gray-300 cursor-pointer ${
    activeSection === "products" ? "border-b-2 border-pink-500" : ""
  }`}
  onClick={() => {
    setActiveSection("products");
    setSidebarOpen(false);
  }}
>
 Sản phẩm
</li>
          <li
  className={`mb-4 hover:text-gray-300 cursor-pointer ${
    activeSection === "settings" ? "border-b-2 border-pink-500" : ""
  }`}
  onClick={() => {
    setActiveSection("settings");
    setSidebarOpen(false);
  }}
>
  Cài đặt
</li>
          <li
            className="mb-4 hover:text-gray-300 cursor-pointer"
            onClick={() => {
              // Handle logout nếu cần
              setSidebarOpen(false);
            }}
          >
            Đăng xuất
          </li>
        </ul>
      </div>

      {/* Nội dung chính */}
      <div className="flex-1 p-6 lg:w-3/4">
        {activeSection === "dashboard" && (
          <div className="bg-white shadow-lg rounded-2xl p-4">
            <h2 className="text-xl font-semibold mb-4">Thống kê doanh thu</h2>
            <div className="w-full h-64 bg-gray-200 flex items-center justify-center rounded-lg">
              <p className="text-gray-500">Biểu đồ sẽ hiển thị ở đây</p>
            </div>
          </div>
        )}

        {activeSection === "products" && (
          <div className="bg-white shadow-lg rounded-2xl p-4">
            {/* Thanh tìm kiếm và bộ lọc */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
              <h2 className="text-xl font-semibold">Danh sách sản phẩm</h2>
              <div className="flex flex-col md:flex-row gap-2">
                <input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  className="border rounded-lg p-2"
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {/* Bộ lọc theo danh mục */}
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="border rounded-lg p-2"
                >
                  <option value="all">Tất cả danh mục</option>
                  <option value="áo">Áo</option>
                  <option value="quần">Quần</option>
                </select>
                {/* Bộ lọc theo giới tính */}
                <select
                  value={filterGender}
                  onChange={(e) => setFilterGender(e.target.value)}
                  className="border rounded-lg p-2"
                >
                  <option value="all">Tất cả giới tính</option>
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                </select>
                <Link
                  to="/add-product"
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  Thêm sản phẩm
                </Link>
              </div>
            </div>

            {/* Danh sách sản phẩm hiển thị theo dạng vertical */}
            <div className="space-y-4">
              {displayedProducts.map((product) => (
                <div
                  key={product.ProductID}
                  className="flex items-center justify-between border-b pb-3"
                >
                  {/* Thông tin sản phẩm */}
                  <div className="flex items-center">
                    <img
                      src={`http://localhost:2000/image/${product.ImageURL.split(",")[0].trim()}`}
                      alt={product.Name}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                    <div className="ml-4">
                      <h3 className="font-semibold text-lg">{product.Name}</h3>
                      <p className="text-sm text-gray-700">
                        Giá: {product.Price} đ
                      </p>
                      {product.SalePercent ? (
                        <p className="text-sm text-red-500">
                          Sale: {product.SalePercent}%
                        </p>
                      ) : null}
                    </div>
                  </div>
                  {/* Các nút hành động */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleOpenDetailModal(product)}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                    >
                      Xem chi tiết
                    </button>
                    <button
                      onClick={() => navigate(`/edit-product/${product.ProductID}`)}
                      className="px-3 py-1 bg-cyan-500 text-white rounded hover:bg-cyan-600 transition"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(product.ProductID)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                    >
                      Xóa
                    </button>
                    <button
                      onClick={() => handleOpenCreateSaleModal(product)}
                      className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition"
                    >
                      Tạo Sale
                    </button>
                    <button
                      onClick={() => handleOpenEditSaleModal(product)}
                      className="px-3 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500 transition"
                    >
                      Sửa Sale
                    </button>
                    <button
                      onClick={() => handleDeleteSale(product.ProductID)}
                      className="px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 transition"
                    >
                      Xóa Sale
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Phân trang */}
            {totalPages > 1 && (
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
            )}
          </div>
        )}

        {activeSection === "orders" && (
          <div className="bg-white shadow-lg rounded-2xl p-4">
            <h2 className="text-xl font-semibold mb-4">Quản lý Đơn hàng</h2>
            <OrdersPage />
          </div>
        )}

        {activeSection === "customers" && (
          <div className="bg-white shadow-lg rounded-2xl p-4">
            <h2 className="text-xl font-semibold mb-4">Danh sách Khách hàng</h2>
            <CustomerList />
          </div>
        )}

        {activeSection === "settings" && (
          <div className="bg-white shadow-lg rounded-2xl p-4">
            <h2 className="text-xl font-semibold mb-4">Cài đặt</h2>
            <SettingsPage/>
          </div>
        )}
      </div>

      {/* Modal chi tiết sản phẩm */}
      {detailModalOpen && selectedDetailProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl relative">
            <button
              onClick={() => setDetailModalOpen(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              <FaTimes />
            </button>
            <h2 className="text-2xl font-semibold mb-4">Chi tiết sản phẩm</h2>
            {/* Hiển thị tất cả ảnh sản phẩm nếu có (grid 3 cột) */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {selectedDetailProduct.ImageURL.split(",").map((img, index) => (
                <img
                  key={index}
                  src={`http://localhost:2000/image/${img.trim()}`}
                  alt={selectedDetailProduct.Name}
                  className="w-full h-32 object-cover rounded-md"
                />
              ))}
            </div>
            <div className="space-y-2">
              <p>
                <span className="font-semibold">Tên:</span> {selectedDetailProduct.Name}
              </p>
              <p>
                <span className="font-semibold">Giá:</span> {selectedDetailProduct.Price} đ
              </p>
              <p>
                <span className="font-semibold">Giảm giá:</span>{" "}
                {selectedDetailProduct.SalePercent ? `${selectedDetailProduct.SalePercent}%` : "—"}
              </p>
              <p>
                <span className="font-semibold">Ngày bắt đầu sale:</span>{" "}
                {selectedDetailProduct.SaleStart
                  ? new Date(selectedDetailProduct.SaleStart).toLocaleDateString()
                  : "—"}
              </p>
              <p>
                <span className="font-semibold">Ngày kết thúc sale:</span>{" "}
                {selectedDetailProduct.SaleEnd
                  ? new Date(selectedDetailProduct.SaleEnd).toLocaleDateString()
                  : "—"}
              </p>
              <p>
                <span className="font-semibold">Danh mục:</span>{" "}
                {selectedDetailProduct.CategoryID === 1
                  ? "áo"
                  : selectedDetailProduct.CategoryID === 2
                  ? "quần"
                  : selectedDetailProduct.CategoryID}
              </p>
              <p>
                <span className="font-semibold">Giới tính:</span>{" "}
                {selectedDetailProduct.Gender ? selectedDetailProduct.Gender : "—"}
              </p>
              <p>
                <span className="font-semibold">Size:</span> {selectedDetailProduct.Size}
              </p>
              <p>
                <span className="font-semibold">Màu:</span> {selectedDetailProduct.Color}
              </p>
              <p>
                <span className="font-semibold">Kho:</span> {selectedDetailProduct.Stock}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal thêm/cập nhật Sale (phần cũ) */}
      {saleModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
            <button
              onClick={handleCloseSaleModal}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              <FaTimes />
            </button>
            <h2 className="text-xl font-semibold mb-4">
              {isUpdatingSale ? "Sửa Sale" : "Tạo Sale"}
            </h2>
            <form onSubmit={handleSaleSubmit} className="space-y-4">
              <div>
                <label className="block font-medium mb-1">Phần trăm Sale (%)</label>
                <input
                  type="number"
                  name="salePercent"
                  value={saleFormData.salePercent}
                  onChange={handleSaleInputChange}
                  className="w-full border border-gray-300 rounded p-2"
                  required
                  min={0}
                  max={99}
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Giá sau giảm</label>
                <input
                  type="number"
                  name="salePrice"
                  value={saleFormData.salePrice}
                  onChange={handleSaleInputChange}
                  className="w-full border border-gray-300 rounded p-2"
                  disabled
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Ngày bắt đầu</label>
                <input
                  type="date"
                  name="saleStart"
                  value={saleFormData.saleStart}
                  onChange={handleSaleInputChange}
                  className="w-full border border-gray-300 rounded p-2"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Ngày kết thúc</label>
                <input
                  type="date"
                  name="saleEnd"
                  value={saleFormData.saleEnd}
                  onChange={handleSaleInputChange}
                  className="w-full border border-gray-300 rounded p-2"
                />
              </div>

              <div className="flex justify-end mt-4">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  {isUpdatingSale ? "Cập nhật" : "Tạo"}
                </button>
                <button
                  type="button"
                  onClick={handleCloseSaleModal}
                  className="ml-2 bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;







