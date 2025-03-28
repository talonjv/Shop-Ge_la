import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const EditProduct = () => {
  const { id } = useParams();       // Lấy ID từ URL
  const navigate = useNavigate();    // Để quay lại trang trước

  // Thông tin sản phẩm (dùng để check loading, null)
  const [product, setProduct] = useState(null);
  // Loading khi fetch data
  const [loading, setLoading] = useState(true);

  // Các trường thông tin cơ bản
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");

  // Các trường khác (nếu DB có)
  const [gender, setGender] = useState("");
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [stock, setStock] = useState(0);
  const [categoryID, setCategoryID] = useState(1);

  // Ảnh cũ từ DB
  const [imageUrls, setImageUrls] = useState([]);
  // Ảnh cũ đang chọn để giữ lại
  const [selectedImages, setSelectedImages] = useState([]);

  // Ảnh mới (File object)
  const [newFiles, setNewFiles] = useState([]);
  // Preview ảnh mới
  const [previewImages, setPreviewImages] = useState([]);

  //---------------------------------------------
  // 1) Lấy sản phẩm (GET) khi vào trang
  //---------------------------------------------
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`http://localhost:2000/api/v1/productcartdetail/${id}`);
        console.log("Dữ liệu nhận được:", res.data);

        if (res.data && res.data.data) {
          const prod = res.data.data;
          setProduct(prod);

          // Gán vào state form
          setName(prod.Name || "");
          setPrice(prod.Price || "");
          setDescription(prod.Description || "");
          setGender(prod.Gender || "");
          setSize(prod.Size || "");
          setColor(prod.Color || "");
          setStock(prod.Stock || 0);
          setCategoryID(prod.CategoryID || 1);

          // Tách ImageURL thành mảng
          const images = prod.ImageURL ? prod.ImageURL.split(",") : [];
          setImageUrls(images);
          setSelectedImages(images); // Mặc định chọn hết
        } else {
          console.error("Không có dữ liệu sản phẩm!");
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu sản phẩm:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  //---------------------------------------------
  // 2) Toggle ảnh cũ (chọn/bỏ chọn)
  //---------------------------------------------
  const handleImageClick = (imgUrl) => {
    setSelectedImages((prev) => {
      if (prev.includes(imgUrl)) {
        return prev.filter((url) => url !== imgUrl);
      } else {
        return [...prev, imgUrl];
      }
    });
  };

  //---------------------------------------------
  // 3) Chọn file mới + preview
  //---------------------------------------------
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setNewFiles(files);

    const previews = files.map((file) => URL.createObjectURL(file));
    setPreviewImages(previews);
  };

  //---------------------------------------------
  // 4) Upload file mới (nếu có)
  //---------------------------------------------
  const handleUpload = async () => {
  const formData = new FormData();
  // newFiles là mảng các file mà user chọn
  newFiles.forEach((file) => {
    formData.append("images", file);
  });

  try {
    // Gửi POST/PUT/... tuỳ theo thiết kế
    await axios.put(`http://localhost:2000/api/v1/update-product/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  } catch (error) {
    console.error(error);
  }
};


  //---------------------------------------------
  // 5) Submit form (PUT)
  //---------------------------------------------
const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const formData = new FormData();
    formData.append("Name", name);
    formData.append("Price", price);
    formData.append("Description", description);
    formData.append("Gender", gender);
    formData.append("Size", size);
    formData.append("Color", color);
    formData.append("Stock", stock);
    formData.append("CategoryID", categoryID);
    // Gửi danh sách ảnh cũ được giữ lại (đã chọn) dưới dạng chuỗi phân cách bởi dấu phẩy
    formData.append("ImageURL", selectedImages.join(","));

    // Nếu có file mới thì append từng file
    newFiles.forEach((file) => {
      formData.append("images", file);
    });

    const response = await axios.put(
      `http://localhost:2000/api/v1/update-product/${id}`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    if (response.data && response.data.success) {
      alert("Cập nhật sản phẩm thành công!");
      navigate(-1);
    } else {
      alert(response.data.message || "Cập nhật thất bại!");
    }
  } catch (error) {
    console.error("Lỗi khi cập nhật sản phẩm:", error);
    alert("Có lỗi xảy ra khi cập nhật!");
  }
};


  //---------------------------------------------
  // 6) Render
  //---------------------------------------------
  if (loading) {
    return <div>Đang tải dữ liệu...</div>;
  }
  if (!product) {
    return <div>Lỗi: Không tìm thấy sản phẩm!</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Chỉnh sửa sản phẩm</h1>

      {/* Nút quay lại */}
       <button onClick={() => navigate(-1)}
      className="flex h-12 w-24 items-center justify-center bg-white border-none rounded-md tracking-wide transition-all duration-200 ease-linear shadow-md hover:shadow-xl hover:-translate-y-0.5">
  <svg className="mr-2 ml-2 w-5 h-5 transition-all duration-400 ease-in hover:-translate-x-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" fill="currentColor">
    <path d="M874.690416 495.52477c0 11.2973-9.168824 20.466124-20.466124 20.466124l-604.773963 0 188.083679 188.083679c7.992021 7.992021 7.992021 20.947078 0 28.939099-4.001127 3.990894-9.240455 5.996574-14.46955 5.996574-5.239328 0-10.478655-1.995447-14.479783-5.996574l-223.00912-223.00912c-3.837398-3.837398-5.996574-9.046027-5.996574-14.46955 0-5.433756 2.159176-10.632151 5.996574-14.46955l223.019353-223.029586c7.992021-7.992021 20.957311-7.992021 28.949332 0 7.992021 8.002254 7.992021 20.957311 0 28.949332l-188.073446 188.073446 604.753497 0C865.521592 475.058646 874.690416 484.217237 874.690416 495.52477z"></path>
  </svg>
  <span>Back</span>
</button>

      <form onSubmit={handleSubmit}>
        {/* Tên sản phẩm */}
        <div className="mb-4">
          <label className="block mb-2 font-semibold">Tên sản phẩm</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        {/* Giá */}
        <div className="mb-4">
          <label className="block mb-2 font-semibold">Giá</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        {/* Mô tả */}
        <div className="mb-4">
          <label className="block mb-2 font-semibold">Mô tả</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        {/* Giới tính */}
        <div className="mb-4">
          <label className="block mb-2 font-semibold">Giới tính</label>
          <input
            type="text"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Size */}
        <div className="mb-4">
          <label className="block mb-2 font-semibold">Size</label>
          <input
            type="text"
            value={size}
            onChange={(e) => setSize(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Color */}
        <div className="mb-4">
          <label className="block mb-2 font-semibold">Màu</label>
          <input
            type="text"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Stock */}
        <div className="mb-4">
          <label className="block mb-2 font-semibold">Kho</label>
          <input
            type="number"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>

        {/* CategoryID */}
        <div className="mb-4">
          <label className="block mb-2 font-semibold">CategoryID</label>
          <input
            type="number"
            value={categoryID}
            onChange={(e) => setCategoryID(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Ảnh cũ */}
        <div className="mb-4">
          <label className="block mb-2 font-semibold">Ảnh cũ (chọn/bỏ chọn)</label>
          <div className="flex gap-2">
            {imageUrls.length > 0 ? (
              imageUrls.map((url, idx) => {
                const isSelected = selectedImages.includes(url);
                return (
                  <img
                    key={idx}
                    src={`http://localhost:2000/image/${url}`}
                    alt={`Ảnh ${idx + 1}`}
                    className={`w-20 h-20 object-cover rounded cursor-pointer border-2 ${
                      isSelected ? "border-blue-500" : "border-transparent"
                    }`}
                    onClick={() => handleImageClick(url)}
                  />
                );
              })
            ) : (
              <p>Không có ảnh</p>
            )}
          </div>
        </div>

        {/* Upload ảnh mới */}
        <div className="mb-4">
          <label className="block mb-2 font-semibold">Upload ảnh mới (nhiều ảnh)</label>
          <input type="file" multiple onChange={handleFileChange} />
          {/* Preview ảnh mới */}
          {previewImages.length > 0 && (
            <div className="flex gap-2 mt-2">
              {previewImages.map((src, idx) => (
                <img
                  key={idx}
                  src={src}
                  alt={`Ảnh mới ${idx + 1}`}
                  className="w-20 h-20 object-cover rounded border"
                />
              ))}
            </div>
          )}
        </div>

        {/* Nút submit */}
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Cập nhật sản phẩm
        </button>
      </form>
    </div>
  );
};

export default EditProduct;










            


