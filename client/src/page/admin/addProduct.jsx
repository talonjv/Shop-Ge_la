import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function NewProducts() {
  const navigate = useNavigate();

  // State để lưu danh sách category
  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    Name: "",
    Description: "",
    Price: "",
    Gender: "Male",
    Size: "",
    Color: "",
    Stock: "",
    CategoryID: "",
    IsVisible: "1",
    images: []
  });

  const [previewImages, setPreviewImages] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Lấy danh sách categories từ backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Gọi API lấy danh mục
        const response = await axios.get("http://localhost:2000/api/v1/categories");
        if (response.data.success) {
          setCategories(response.data.data); // Lưu vào state
        } else {
          console.log("Không thể lấy danh mục:", response.data.message);
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh mục:", error);
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData((prevData) => ({ ...prevData, images: files }));

    const imagePreviews = files.map((file) => URL.createObjectURL(file));
    setPreviewImages(imagePreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.Name || !formData.Price || !formData.Stock || !formData.CategoryID) {
      setErrorMessage("Vui lòng nhập đầy đủ thông tin sản phẩm.");
      return;
    }

    if (formData.images.length === 0) {
      setErrorMessage("Vui lòng chọn ít nhất một hình ảnh.");
      return;
    }

    // Tạo FormData để gửi
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key === "images") {
        value.forEach((file) => data.append("images", file));
      } else {
        data.append(key, value);
      }
    });

    try {
      const response = await axios.post("http://localhost:2000/api/v1/add-new-product", data, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      console.log(response.data);
      setSuccessMessage("Sản phẩm đã được thêm thành công!");
      setErrorMessage("");

      setTimeout(() => {
        navigate("/admin");
      }, 1000);
    } catch (error) {
      setErrorMessage("Lỗi: " + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
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
      <h2 className="text-xl font-bold mb-4 text-center">🛒 Thêm Sản Phẩm</h2>

      {successMessage && (
        <div className="bg-green-200 text-green-700 p-2 rounded mb-4 text-center">
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="bg-red-200 text-red-700 p-2 rounded mb-4 text-center">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="Name"
          placeholder="Tên sản phẩm"
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400"
          onChange={handleChange}
          value={formData.Name}
          required
        />
        <textarea
          name="Description"
          placeholder="Mô tả"
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400"
          onChange={handleChange}
          value={formData.Description}
        ></textarea>
        <input
          type="number"
          name="Price"
          placeholder="Giá"
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400"
          onChange={handleChange}
          value={formData.Price}
          required
        />

        <select
          name="Gender"
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400"
          onChange={handleChange}
          value={formData.Gender}
        >
          <option value="Male">Nam</option>
          <option value="Female">Nữ</option>
        </select>

        <input
          type="text"
          name="Size"
          placeholder="Kích cỡ (vd: M, L)"
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400"
          onChange={handleChange}
          value={formData.Size}
        />
        <input
          type="text"
          name="Color"
          placeholder="Màu sắc"
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400"
          onChange={handleChange}
          value={formData.Color}
        />
        <input
          type="number"
          name="Stock"
          placeholder="Số lượng"
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400"
          onChange={handleChange}
          value={formData.Stock}
          required
        />

        {/* Select danh mục thay vì nhập ID thủ công */}
        <select
          name="CategoryID"
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400"
          onChange={handleChange}
          value={formData.CategoryID}
          required
        >
          <option value="">-- Chọn danh mục --</option>
          {categories.map((cat) => (
            <option key={cat.CategoryID} value={cat.CategoryID}>
              {cat.CategoryName}
            </option>
          ))}
        </select>

        {/* Upload Hình Ảnh */}
        <label className="w-full flex items-center justify-center p-2 border rounded cursor-pointer bg-gray-100 hover:bg-gray-200 transition duration-200">
          📷 Chọn ảnh
          <input
            type="file"
            name="images"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
        </label>

        {/* Hiển thị hình ảnh được chọn */}
        {previewImages.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mt-2">
            {previewImages.map((src, index) => (
              <img
                key={index}
                src={src}
                alt="preview"
                className="w-20 h-20 object-cover rounded-lg shadow"
              />
            ))}
          </div>
        )}
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition duration-200"
        >
          ➕ Thêm Sản Phẩm
        </button>
      </form>
    </div>
  );
}








