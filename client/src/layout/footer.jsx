import { Link } from "react-router";
import "tailwindcss/tailwind.css";

const Footer = () => {
  return (
    <footer className="bg-white py-10 border-t mt-2">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-start px-6 md:px-12">
        <div>
          <h2 className="text-2xl font-bold">LIAMI</h2>
          <div className="flex space-x-4 mt-4">
            <Link to="https://www.instagram.com/nmphuonggneh/" className="text-gray-600 hover:text-black">Facebook</Link>
            <Link to="https://www.instagram.com/nmphuonggneh/" className="text-gray-600 hover:text-black">Instagram</Link>
            <Link to="https://www.instagram.com/nmphuonggneh/" className="text-gray-600 hover:text-black">Twitter</Link>
            <Link to="https://www.instagram.com/nmphuonggneh/" className="text-gray-600 hover:text-black">YouTube</Link>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-6 md:mt-0">
          <div>
            <h3 className="font-semibold text-lg">Shop</h3>
            <ul className="mt-2 space-y-2 text-gray-600">
              <li className=" hover:text-red-400"><Link to="https://www.instagram.com/nmphuonggneh/">Long Fit T-shirt</Link></li>
              <li className=" hover:text-red-400"><Link to="#">Short Fit T-shirt</Link></li>
              <li className=" hover:text-red-400"><Link to="#">Long Fit Pant</Link></li>
              <li className=" hover:text-red-400"><Link to="#">Short Fit Pant</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-lg">Blog</h3>
            <ul className="mt-2 space-y-2 text-gray-600">
              <li className=" hover:text-red-400"><Link to="#">Standard</Link></li>
              <li className=" hover:text-red-400"><Link to="#">Audio</Link></li>
              <li className=" hover:text-red-400"><Link to="#">Video</Link></li>
              <li className=" hover:text-red-400"><Link to="#">Quote</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-lg">Company</h3>
            <ul className="mt-2 space-y-2 text-gray-600 ">
              <li className=" hover:text-red-400"><Link to="#">About</Link></li>
              <li className=" hover:text-red-400"><Link to="#">Content Elements</Link></li>
              <li className=" hover:text-red-400"><Link to="#">Help</Link></li>
              <li className=" hover:text-red-400"><Link to="#">Contact</Link></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t mt-10 pt-4 text-gray-600 text-center">
        <div className="flex justify-center space-x-6 ">
          <Link to="#">Privacy Policy</Link>
          <span>•</span>
          <Link to="#">Terms of Service</Link>
          <span>•</span>
          <span>© Gela Make it harder.</span>
        </div>
        <div className="mt-4 flex justify-center items-center space-x-4">
          <span>Accept for</span>
          <img src="/visa.png" alt="Visa" className="h-6" />
          <img src="/amex.png" alt="Amex" className="h-6" />
          <img src="/mastercard.png" alt="Mastercard" className="h-6" />
          <img src="/paypal.png" alt="PayPal" className="h-6" />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
