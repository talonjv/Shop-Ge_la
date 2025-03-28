import { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import axios from "axios";

export default function NewProducts() {
  const navigate = useNavigate(); // Khai báo useNavigate
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData((prevData) => ({ ...prevData, images: files }));

    const imagePreviews = files.map(file => URL.createObjectURL(file));
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

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key === "images") {
        value.forEach(file => data.append("images", file));
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
        navigate("/admin"); // Chuyển về trang admin sau 1 giây
      }, 1000);
      
    } catch (error) {
      setErrorMessage("Lỗi: " + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
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
        <input type="text" name="Name" placeholder="Tên sản phẩm" className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400" onChange={handleChange} value={formData.Name} required />
        <textarea name="Description" placeholder="Mô tả" className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400" onChange={handleChange} value={formData.Description}></textarea>
        <input type="number" name="Price" placeholder="Giá" className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400" onChange={handleChange} value={formData.Price} required />
        
        <select name="Gender" className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400" onChange={handleChange} value={formData.Gender}>
          <option value="Male">Nam</option>
          <option value="Female">Nữ</option>
        </select>

        <input type="text" name="Size" placeholder="Kích cỡ (vd: M, L)" className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400" onChange={handleChange} value={formData.Size} />
        <input type="text" name="Color" placeholder="Màu sắc" className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400" onChange={handleChange} value={formData.Color} />
        <input type="number" name="Stock" placeholder="Số lượng" className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400" onChange={handleChange} value={formData.Stock} required />

        <input type="text" name="CategoryID" placeholder="ID Danh mục" className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400" onChange={handleChange} value={formData.CategoryID} required />

        {/* Upload Hình Ảnh */}
        <label className="w-full flex items-center justify-center p-2 border rounded cursor-pointer bg-gray-100 hover:bg-gray-200 transition duration-200">
          📷 Chọn ảnh
          <input type="file" name="images" multiple className="hidden" onChange={handleFileChange} />
        </label>

        {/* Hiển thị hình ảnh được chọn */}
        {previewImages.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mt-2">
            {previewImages.map((src, index) => (
              <img key={index} src={src} alt="preview" className="w-20 h-20 object-cover rounded-lg shadow" />
            ))}
          </div>
        )}

        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition duration-200">
          ➕ Thêm Sản Phẩm
        </button>
      </form>
    </div>
  );
}






