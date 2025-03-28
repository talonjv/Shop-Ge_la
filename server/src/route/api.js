import express from 'express';
import apiController from '../controller/apiController.js';
import apiUser from '../controller/apiUser.js';
import apiProduct from '../controller/apiProduct.js'
import multer from 'multer';
import path from 'path';
import appRoot from 'app-root-path';
import upload from '../middleware/upload.js';
let router = express.Router();
// Chuyển JSON string của slide sang mảng (nếu null thì trả mảng rỗng)
function parseJsonArray(jsonString) {
  try {
    return jsonString ? JSON.parse(jsonString) : [];
  } catch (err) {
    return [];
  }
}

// Chuyển mảng sang JSON string (dành cho slide)
function stringifyJsonArray(arr) {
  try {
    return JSON.stringify(arr || []);
  } catch (err) {
    return "[]";
  }
}

// Lấy đường dẫn file từ mảng file do Multer cung cấp
function getFilePaths(files) {
  return files.map((f) => f.path);
}

// Cấu hình upload:
// - banner chỉ cho phép 1 file
// - slide cho phép nhiều file
const multiUpload = upload.fields([
  { name: "banner", maxCount: 1 },
  { name: "slide", maxCount: 10 },
]);
const initAPIroute = (app) => {
    // api customer
    router.get('/customer', apiController.getAlluser); // method get = read data
    router.post('/create-customer', apiController.createUser); // method post = create data
    router.put('/update-user', apiController.updateUser); // method put = update data
    router.delete('/delete-user/:id', apiController.deleteUser); // method delete = delete data
    router.post('/search-user', apiController.searchUser);
    //api admin 
    router.post('/admins',upload.single('ProfilePicture'), apiUser.createAdmin);
    router.get('/admins', apiUser.getAdmin);
    router.get('/admins/:id', apiUser.getAdminByID);
    router.put('/admins/:id',upload.single('ProfilePicture'), apiUser.updateAdmin);
    //api quản lý customer
    router.get('/customers',apiUser.apigetCustomer)
    router.get('/get-customer/:id',apiUser.apigetUpdateCustomer)
    router.put('/update-customer/:id',upload.single("ProfilePicture"),apiUser.apiUpdateCustomer)
    router.delete('/delete-customer/:id',apiUser.apidelCustomer)
    router.get('/revenue/daily',apiUser.reVenueDaily)
    router.get('/revenue/monthly',apiUser.reVenueMonthly)
    router.get('/revenue/quarterly',apiUser.reVenueQuarterly)
    // api user
    router.post('/register', apiUser.regisTer);
    router.post('/login', apiUser.apiLogin);
    router.post('/logout', apiUser.apiLogOut);
    router.get('/customer/:id', apiUser.viewProfile);
    router.put('/change-customer/:customerId', apiUser.changeProfile);
    router.post('/change-avatar/:customerId/avatar',upload.single("avatar"),apiUser.changeAvatar);
    // api reset password
    router.post('/send-otp', apiUser.apiOTP);
    router.post('/reset-password', apiUser.resetPassword);
    // kiểm tra session
    router.get('/check-ss', apiUser.apiCheck);
    // api product quản lý sản phảm
    router.get('/categories',apiProduct.getAllCategories);
    router.get('/search',apiProduct.searchProduct);
    router.get('/products',apiProduct.viewProduct);
    router.get('/products-with-cat/:type',apiProduct.productWithCat)
    router.get('/products/:id',apiProduct.productDetail)
    router.post('/add-new-product',upload.array('images', 10),apiProduct.addNewProduct)
    router.delete('/delete-product/:id',apiProduct.deleteProduct)
    router.put('/update-product/:id',upload.array("images",10),apiProduct.updateProduct)
    //add to cart API giỏ hàng
    router.get('/cart/:customerId',apiProduct.getCart)
    // router.get('/cart/:customerId',apiProduct.getCart)
    router.delete('/cart/:customerId/:productId',apiProduct.reMoveItem)
    router.put('/cart/:customerId/:productId',apiProduct.updateCartItem)
    router.get('/productcartdetail/:id',apiProduct.productcartDetail)
    router.post('/add-to-cart',apiProduct.addtoCart)
    // api quản lý comment
    router.get('/reviews/product/:id',apiProduct.getreViews)
    router.get('/reviews/customer/:customerId',apiProduct.getReviewByID)
    router.post('/reviews',apiProduct.createReview)
    router.put('/reviews/:reviewId',apiProduct.updateReview)
    router.delete('/reviews/:reviewId',apiProduct.deleteReview)
    //api quản lý sale
    router.get('/products-with-sale',apiProduct.productWithSale)
    router.get('/salesreports',apiProduct.getSale)
    router.get('/salesreports/:productID',apiProduct.getSale)
    router.post('/createsales',apiProduct.saleProduct)
    router.put('/salesreports/:productID', apiProduct.updateSaleProduct);
    router.delete('/salesreports/:productID', apiProduct.deleteSaleProduct);
    //api quản lý orde
    router.post('/orders',apiProduct.apiOders)
    router.get('/order/customer/:customerID',apiProduct.getOderbyID)
    router.get('/order',apiProduct.getOrders)
    router.put('/order/:orderID',apiProduct.updateOrder)
    router.delete('/order-clear/:customerId',apiProduct.clearCart)//đặt hàng xong sẽ xóa sản phẩm trong giỏ hàng
    //api quản lý Address
    router.get('/address/:customerId',apiProduct.getAddressbyID)
    router.post('/address',apiProduct.createAddress)
    router.put('/address/:id',apiProduct.updateAddress)
    router.delete('/address/:addressId',apiProduct.deleteAddress)
    router.put('/address/default/:customerId',apiProduct.setDefaultAddress)
    // api động cài đặt
   router.post('/settings', multiUpload, apiUser.apiSetting);
router.get('/getsettings', apiUser.getSetting);
router.get("/settings/:id", apiUser.apiGetSetById);
router.put("/settings/:id", multiUpload, apiUser.apiUpdateseting);
router.delete("/settings/:id", apiUser.apiDeletesetting);
    return app.use('/api/v1', router);
};

export default initAPIroute;