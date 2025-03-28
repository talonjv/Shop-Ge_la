import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../layout/navbar";

export default function ProductSearch() {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (query.trim() === "") {
      setProducts([]);
      return;
    }
    
    const fetchProducts = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await axios.get(`http://localhost:2000/api/v1/search?name=${query}`);
        setProducts(response.data);
      } catch (err) {
        setError("Lỗi khi tìm kiếm sản phẩm");
      } finally {
        setLoading(false);
      }
    };
    
    const delayDebounce = setTimeout(() => {
      fetchProducts();
    }, 500);
    
    return () => clearTimeout(delayDebounce);
  }, [query]);

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

      <div className="max-w-7xl mx-auto p-4">
        <div className="mb-6">
          <input
            type="text"
            placeholder="Nhập tên sản phẩm..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {loading && <p className="text-center text-lg">Đang tìm kiếm...</p>}
        {error && <p className="text-red-500 text-center text-lg">{error}</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <div 
              key={product.id || index} 
              className="border rounded-lg p-4 shadow-md cursor-pointer hover:shadow-xl transition duration-200"
              onClick={() => {
                const slug = product.Name.toLowerCase().replace(/\s+/g, "-");
                const encodedId = btoa(product.ProductID.toString());
                navigate(`/san-pham/${slug}/${encodedId}`);
              }}
            >
              <img 
                src={`http://localhost:2000/image/${product.ImageURL}`} 
                alt={product.Name} 
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <h3 className="text-xl font-semibold mb-2">{product.Name}</h3>
              <p className="text-green-600 font-bold text-lg">{product.Price} VND</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}









