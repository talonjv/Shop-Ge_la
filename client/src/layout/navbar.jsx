import { useState, useEffect, useRef } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import { IoIosSearch } from "react-icons/io";
import { IoPersonCircleSharp } from "react-icons/io5";
import { MdOutlineShoppingBag } from "react-icons/md";
import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import CartReview from "../components/cardLick";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../middleware/userSlice";

export default function Navbar() {
  const [showCart, setShowCart] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [hoverDoNam, setHoverDoNam] = useState(false);
  const [hoverDoNu, setHoverDoNu] = useState(false);

  const cartRef = useRef(null);
  const menuRef = useRef(null);
  const userRef = useRef(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  // Lấy thông tin người dùng từ Redux store
  const user = useSelector((state) => state.user.user);
  const isUserLoggedIn = user && user.customerId;

  // Lấy số lượng giỏ hàng khi user thay đổi
  useEffect(() => {
    if (isUserLoggedIn) {
      fetchCartCount(user.customerId);
    } else {
      setCartCount(0);
    }
  }, [user, isUserLoggedIn]);

  const fetchCartCount = async (id) => {
    try {
      const res = await axios.get(`http://localhost:2000/api/v1/cart/${id}`);
      const items = res.data.cartItems || [];
      const total = items.reduce((acc, item) => acc + (item.Quantity || 0), 0);
      setCartCount(total);
    } catch (error) {
      console.error("Lỗi khi lấy giỏ hàng:", error);
    }
  };

  // Đóng giỏ hàng, menu, user dropdown khi click ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cartRef.current && !cartRef.current.contains(event.target)) {
        setShowCart(false);
      }
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
      if (userRef.current && !userRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Đăng xuất
  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:2000/api/v1/logout", {}, { withCredentials: true });
      dispatch(logout());
      localStorage.removeItem("token");
      setCartCount(0);
      setShowUserDropdown(false);
      navigate("/");
      alert("Đã đăng xuất thành công!");
    } catch (error) {
      console.error("Lỗi đăng xuất:", error.response?.data || error.message);
      alert("Có lỗi xảy ra khi đăng xuất, vui lòng thử lại!");
    }
  };

  // Khi giỏ hàng thay đổi
  const handleCartUpdated = () => {
    if (isUserLoggedIn) {
      fetchCartCount(user.customerId);
    }
  };

  /**
   * NavLink style cho menu chính
   * Sử dụng pseudo-element ::after để tạo gạch hồng dưới text
   */
  const navLinkClass = ({ isActive }) => {
    return `
      relative inline-block px-2 py-2
      text-black
      after:content-[''] after:absolute after:left-0 after:bottom-0
      after:h-[2px] after:bg-pink-500
      after:transition-transform after:duration-300 after:origin-left
      ${
        isActive
          ? 'after:w-full'
          : 'after:w-0 hover:after:w-full'
      }
    `;
  };

  /**
   * Style cho các item trong dropdown
   */
  const dropdownLinkClass = `
    relative block px-4 py-2 whitespace-nowrap
    after:content-[''] after:absolute after:left-0 after:bottom-0
    after:h-[2px] after:bg-pink-500
    after:transition-transform after:duration-300 after:origin-left
    after:w-0 hover:after:w-full
  `;

  return (
    <nav className="flex justify-between items-center p-4 bg-white relative z-50 w-full border-b shadow-md">
      {/* Logo */}
      <Link to="/" className="text-2xl font-semibold ml-4">
        GELA
      </Link>

      {/* Menu Desktop */}
      <div className="hidden lg:flex space-x-10 items-center">
        <NavLink to="/" end className={navLinkClass}>
          Trang chủ
        </NavLink>

        {/* Đồ Nam với Dropdown */}
        <div
  className="relative"
  onMouseEnter={() => setHoverDoNam(true)}
  onMouseLeave={() => setHoverDoNam(false)}
>
  <NavLink to="/do-nam" className={navLinkClass}>
    Đồ Nam
  </NavLink>
  {hoverDoNam && (
    <div className="absolute top-full left-0 bg-white shadow-md rounded-md mt-1">
      <NavLink
        to="/trouser/nam"
        className={dropdownLinkClass}
      >
        Quần Nam
      </NavLink>

      {/* Thay vì to="/shirt" state={{ gender: "male" }} */}
      <NavLink
        to="/shirt/nam"
        className={dropdownLinkClass}
      >
        Áo Nam
      </NavLink>
    </div>
  )}
</div>


        {/* Đồ Nữ với Dropdown */}
       <div
  className="relative"
  onMouseEnter={() => setHoverDoNu(true)}
  onMouseLeave={() => setHoverDoNu(false)}
>
  <NavLink to="/do-nu" className={navLinkClass}>
    Đồ Nữ
  </NavLink>
  {hoverDoNu && (
    <div className="absolute top-full left-0 bg-white shadow-md rounded-md mt-1">
      <NavLink
        to="/trouser/nu"
        className={dropdownLinkClass}
      >
        Quần Nữ
      </NavLink>
      {/* Thay vì to="/shirt" state={{ gender: "female" }} */}
      <NavLink
        to="/shirt/nu"
        className={dropdownLinkClass}
      >
        Áo Nữ
      </NavLink>
    </div>
  )}
</div>

        {/* Hàng giảm giá */}
        <NavLink to="/discount" className={navLinkClass}>
          Hàng giảm giá
        </NavLink>

        <NavLink to="/lien-he" className={navLinkClass}>
          Liên hệ
        </NavLink>
      </div>
      {/* User, Search, Cart */}
      <div className="hidden lg:flex items-center space-x-6">
        {/* Avatar/User Dropdown */}
        <div ref={userRef} className="relative">
          {isUserLoggedIn ? (
            user.avatar ? (
              <img
                src={user.avatar}
                alt="User Avatar"
                className="w-10 h-10 rounded-full cursor-pointer object-cover"
                onMouseEnter={() => setShowUserDropdown(true)}
                onError={(e) => {
                  console.error("Lỗi khi tải avatar:", e.target.src);
                }}
              />
            ) : (
              <IoPersonCircleSharp
                className="w-10 h-10 cursor-pointer text-blue-600"
                onMouseEnter={() => setShowUserDropdown(true)}
              />
            )
          ) : (
            <div className="flex gap-x-3">
              <Link to="/signin">
                <button
                  className="btn relative px-5 py-2 rounded-md border border-blue-600 
                  text-sm uppercase font-semibold tracking-wider bg-transparent
                  text-black overflow-hidden shadow transition-all 
                  duration-200 ease-in hover:bg-blue-600 
                  hover:shadow-[0_0_30px_5px_rgba(0,142,236,0.815)] active:shadow-none"
                >
                  Đăng nhập
                </button>
              </Link>
              <Link to="/register">
                <button
                  className="btn relative px-5 py-2 rounded-md border border-blue-600 
                  text-sm uppercase font-semibold tracking-wider bg-transparent
                  text-black overflow-hidden shadow transition-all 
                  duration-200 ease-in hover:bg-blue-600 
                  hover:shadow-[0_0_30px_5px_rgba(0,142,236,0.815)] active:shadow-none"
                >
                  Đăng ký
                </button>
              </Link>
            </div>
          )}

          {/* Dropdown tài khoản */}
          {showUserDropdown && (
            <div
              className="absolute top-12 right-0 w-48 bg-white shadow-lg border rounded-md p-2"
              onMouseEnter={() => setShowUserDropdown(true)}
              onMouseLeave={() => setShowUserDropdown(false)}
            >
              {isUserLoggedIn ? (
                <>
                  {user.role === "admin" && (
                    <NavLink to="/admin" className="block px-4 py-2 hover:bg-gray-200">
                      Quản trị
                    </NavLink>
                  )}
                  <NavLink to="/profile" className="block px-4 py-2 hover:bg-gray-200">
                    Profile
                  </NavLink>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-200"
                  >
                    Đăng xuất
                  </button>
                </>
              ) : (
                <>
                  <NavLink to="/signin" className="block px-4 py-2 hover:bg-gray-200">
                    Đăng nhập
                  </NavLink>
                  <NavLink to="/register" className="block px-4 py-2 hover:bg-gray-200">
                    Đăng ký
                  </NavLink>
                </>
              )}
            </div>
          )}
        </div>

        {/* Search Icon */}
        <Link to="/tim-kiem">
          <IoIosSearch className="w-10 h-10 text-gray-700 cursor-pointer" />
        </Link>

        {/* Cart Icon */}
        {isUserLoggedIn && (
          <div className="relative">
            <MdOutlineShoppingBag
              className="w-10 h-10 text-gray-700 cursor-pointer"
              onClick={() => setShowCart(!showCart)}
            />
            {cartCount > 0 && (
              <span className="px-2 py-1 text-xs rounded-full absolute bottom-[-5px] left-0 bg-red-500 text-white">
                {cartCount}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Mobile Menu Button */}
      <div className="lg:hidden flex items-center space-x-4">
        <IoIosSearch className="w-6 h-6 text-gray-700 cursor-pointer" />
        {isUserLoggedIn && (
          <div className="relative">
            <MdOutlineShoppingBag
              className="w-6 h-6 text-gray-700 cursor-pointer"
              onClick={() => setShowCart(!showCart)}
            />
            {cartCount > 0 && (
              <span className="px-2 py-1 text-xs rounded-full absolute bottom-[-5px] left-0 bg-red-500 text-white">
                {cartCount}
              </span>
            )}
          </div>
        )}
        <FaBars
          className="w-8 h-8 cursor-pointer"
          onClick={() => setIsMobileMenuOpen(true)}
        />
      </div>

      {/* Mobile Menu Overlay */}
      <div
        ref={menuRef}
        className={`fixed top-0 right-0 h-full bg-white shadow-lg w-64 transform ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300 ease-in-out z-50`}
      >
        <div className="flex justify-end p-4">
          <FaTimes
            className="w-6 h-6 cursor-pointer"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        </div>
        <div className="flex flex-col space-y-4 p-6">
          <NavLink
            to="/"
            end
            className={navLinkClass}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Trang chủ
          </NavLink>

          {/* Mobile Menu: Đồ Nam với submenu */}
          <div className="relative">
            <NavLink
              to="/do-nam"
              className={navLinkClass}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Đồ Nam
            </NavLink>
            <div className="pl-4">
              <NavLink
                to="/do-nam/quan"
                className={navLinkClass}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Quần Nam
              </NavLink>
              <NavLink
                to="/do-nam/ao"
                className={navLinkClass}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Áo Nam
              </NavLink>
            </div>
          </div>

          {/* Mobile Menu: Đồ Nữ với submenu */}
          <div className="relative">
            <NavLink
              to="/do-nu"
              className={navLinkClass}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Đồ Nữ
            </NavLink>
            <div className="pl-4">
              <NavLink
                to="/do-nu/quan"
                className={navLinkClass}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Quần Nữ
              </NavLink>
              <NavLink
                to="/do-nu/ao"
                className={navLinkClass}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Áo Nữ
              </NavLink>
            </div>
          </div>

          {/* Hàng giảm giá */}
          <NavLink
            to="/discount"
            className={navLinkClass}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Hàng giảm giá
          </NavLink>

          <NavLink
            to="/lien-he"
            className={navLinkClass}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Liên hệ
          </NavLink>
        </div>
      </div>

      {/* CartReview */}
      {showCart && isUserLoggedIn && (
        <div ref={cartRef} className="absolute top-16 right-4 p-4 w-72 sm:w-64 z-50">
          <CartReview onClose={() => setShowCart(false)} onCartUpdated={handleCartUpdated} />
        </div>
      )}
    </nav>
  );
}
















