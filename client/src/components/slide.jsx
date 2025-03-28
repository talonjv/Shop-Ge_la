import { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // Nếu bạn dùng React Router
import test1 from "../assets/slide-img2-2.jpg";
import test2 from "../assets/slide-img3-1.jpg";
import test3 from "../assets/slide-img3-2.jpg";
import test4 from "../assets/slide-img2-1.jpg";
import { FaArrowAltCircleLeft, FaArrowAltCircleRight } from "react-icons/fa";
 
const BannerSlider = () => {
  // Mỗi phần tử gồm src (ảnh) và link (đường dẫn chuyển đến)
  const slides = [
    { src: test1, link: "/hotnew" },
    { src: test2, link: "/cart" },
    { src: test3, link: "/page3" },
    { src: test4, link: "/page4" },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  // Tự động chuyển slide
  useEffect(() => {
    const interval = setInterval(() => {
      goToNextSlide();
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Chuyển sang slide tiếp theo
  const goToNextSlide = () => {
    setCurrentSlide((prevIndex) => (prevIndex + 1) % slides.length);
  };

  // Quay về slide trước đó
  const goToPreviousSlide = () => {
    setCurrentSlide((prevIndex) => (prevIndex - 1 + slides.length) % slides.length);
  };

  // Đi tới slide được chọn
  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <div className="relative w-[1350px] overflow-hidden mt-4 mb-4 ml-[5rem]">
      {/* Slides */}
      <div
        className="flex transition-transform duration-500"
        style={{
          transform: `translateX(-${currentSlide * 100}%)`,
        }}
      >
        {slides.map((item, index) => (
          <div
            key={index}
            className="w-full h-[700px] flex-shrink-0 bg-center bg-cover relative"
            style={{
              backgroundImage: `url(${item.src})`,
            }}
          >
            {/* Link bọc toàn bộ slide */}
            <Link to={item.link} className="block w-full h-full" />
          </div>
        ))}
      </div>

      {/* Buttons (Next/Previous) */}
      <div className="absolute top-1/2 w-full flex justify-between transform -translate-y-1/2 px-4">
        <button
          onClick={goToPreviousSlide}
          className="bg-black/50 text-white rounded-full p-2 hover:bg-black/70"
        >
          <FaArrowAltCircleLeft />
        </button>
        <button
          onClick={goToNextSlide}
          className="bg-black/50 text-white rounded-full p-2 hover:bg-black/70"
        >
          <FaArrowAltCircleRight />
        </button>
      </div>

      {/* Pagination */}
      <div className="absolute bottom-4 w-full flex justify-center space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full ${
              index === currentSlide ? "bg-gray-800" : "bg-gray-400"
            } hover:bg-gray-600`}
          ></button>
        ))}
      </div>
    </div>
  );
};

export default BannerSlider;

