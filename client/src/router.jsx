import { createBrowserRouter } from "react-router-dom";
import RegisterForm from "./page/log/register.jsx";
import LoginForm from "./page/log/signin.jsx";
import Dashboard from "./page/admin/admin.jsx";
import App from "./App.jsx";
import ProductDetail from "./components/product.jsx";
import NewProducts from "./page/admin/addProduct.jsx";
import EditProduct from "./page/admin/editproduct.jsx";
import Cart from "./page/user/cart.jsx";
import ForgetPassword from "./page/log/forgotPass.jsx";
import Profile from "./page/user/profile.jsx";
import ProductPageFemale from "./page/user/female.jsx";
import ModeraTor from "./page/admin/moderator.jsx";
import Superadmin from "./page/admin/superadmin.jsx";
import SearchProduct from "./page/searchProduct.jsx";
import CreatePayment from "./page/user/order.jsx";
import AddressCustomer from "./page/user/address.jsx";
import CustomerOrders from "./page/user/CustomerOrder.jsx";
import ProductPageSale from "./page/user/salePage.jsx";
import ProductPageMale from "./page/user/male.jsx";
import ProductPageShirt from "./page/user/shirtpage.jsx";
import ProductPageTrouser from "./page/user/trouserpage.jsx";


export const router = createBrowserRouter([
    { path: "/", element: <App /> },
    { path: "/admin", element: <Dashboard /> },
    { path: "/superadmin", element: <Superadmin /> },
    { path: "/moderator", element: <ModeraTor/> },
    
    { path: "/register", element: <RegisterForm /> },
    { path: "/signin", element: <LoginForm /> },
    { path: "/add-product", element: <NewProducts /> },
    { path: "/edit-product/:id", element: <EditProduct /> },
    { path: "/do-nam", element: <ProductPageMale />, },
    {path: "/do-nu",element: <ProductPageFemale />},
    { path: "/discount",element: <ProductPageSale />},
    { path: "/shirt",element: <ProductPageShirt />},
    { path:"/shirt/:genderParam", element:<ProductPageShirt />} ,
     { path: "/trouser",element: <ProductPageTrouser />},
     { path:"/trouser/:genderParam", element:<ProductPageTrouser />} ,
  { path: "/san-pham/:slug/:encodedId", element: <ProductDetail />},
  { path: "/do-nam/:slug/:encodedId", element: <ProductDetail />},
  { path: "/do-nu/:slug/:encodedId", element: <ProductDetail />},
  { path: "/discount/:slug/:encodedId", element: <ProductDetail />},
    { path: "/tim-kiem", element: <SearchProduct /> },
    // { path: "/product/:id", element: <ProductDetail /> },
    { path: "/cart", element: <Cart /> },
     { path: "/dat-hang", element: <CreatePayment /> },
     { path: "/don-hang", element: <CustomerOrders /> },
     { path: "/dia-chi", element: <AddressCustomer /> },
    { path: "/forgot-password", element: <ForgetPassword /> },
    { path: "/profile", element: <Profile /> },

]);
