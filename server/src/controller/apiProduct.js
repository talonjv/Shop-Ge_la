import pool from '../config/connectdb.js';
import { sendEmail } from '../middleware/mailer.js';


const getAllCategories = async (req , res) =>{
  try {
    // Lấy dữ liệu từ bảng categories
    const [rows] = await pool.query("SELECT * FROM categories");
    
    // rows sẽ là mảng các object { CategoryID, CategoryName, ParentID, IsVisible, ... }
    res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Lỗi khi lấy categories:", error);
    res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi khi lấy danh mục.",
    });
  }
}
const viewProduct = async (req, res) => {
    try {
        const [rows] = await pool.execute("SELECT * FROM products  ");
        return res.status(200).json({
            message: "Lấy danh sách sản phẩm thành công",
            data: rows, // Đưa danh sách sản phẩm vào key "data"
        });
    } catch (error) {
        console.error("Lỗi khi lấy sản phẩm:", error);
        return res.status(500).json({
            message: "Lỗi server",
            error: error.message,
        });
    }
};
const addNewProduct = async (req, res) => {
    try {
        const { Name, Description, Price, Gender, Size, Color, Stock, IsVisible, CategoryID } = req.body;

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: "At least one image is required" });
        }

        if (!Name || !Price || !Stock || !CategoryID) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const priceValue = parseFloat(Price);
        const stockValue = parseInt(Stock, 10);
        const isVisibleValue = IsVisible ? 1 : 0;

        if (isNaN(priceValue) || isNaN(stockValue)) {
            return res.status(400).json({ error: "Price and Stock must be numbers" });
        }

        const imageUrls = req.files.map(file => file.filename).join(',');

        if (!pool) {
            return res.status(500).json({ error: "Database connection failed" });
        }

        const categoryCheckQuery = `SELECT * FROM categories WHERE CategoryID = ?`;
        const [categoryRows] = await pool.query(categoryCheckQuery, [CategoryID]);

        if (categoryRows.length === 0) {
            return res.status(400).json({ error: "Invalid CategoryID: Category does not exist" });
        }

        const sql = `INSERT INTO products (Name, Description, Price, Gender, Size, Color, Stock, ImageURL, IsVisible) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const values = [Name, Description, priceValue, Gender, Size, Color, stockValue, imageUrls, isVisibleValue];

        const [result] = await pool.execute(sql, values);

        res.status(201).json({ message: 'Product added successfully', productId: result.insertId });

    } catch (error) {
        console.error("Error adding product:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
};
// const productDetail = async (req, res) => {
//   const { id } = req.params;
//   console.log(`🟢 Nhận request với ProductID: ${id}`);

//   if (!id) {
//     return res.status(400).json({ message: "Thiếu ProductID!" });
//   }

//   const sql = "SELECT * FROM products WHERE ProductID = ?";

//   try {
//     console.log("🔄 Đang chạy query...");
    
//     // Gọi query trực tiếp từ pool (vì pool đã có .promise())
//     const rows = await pool.query(sql, [id]);

//     if (rows.length === 0) {
//       console.warn(`⚠️ Không tìm thấy sản phẩm với ID ${id}`);
//       return res.status(404).json({ message: "Sản phẩm không tồn tại!" });
//     }

//     console.log("✅ Lấy sản phẩm thành công:", rows[0]);
//     res.status(200).json({
//       success: true,
//       data: rows[0],
//     });

//   } catch (error) {
//     console.error("❌ Lỗi khi lấy sản phẩm:", error);
//     return res.status(500).json({ message: "Lỗi server!", error: error.message });
//   }
// };

const productDetail = async (req, res) => {
  const { id } = req.params;
  console.log(`🟢 Nhận request với ProductID: ${id}`);

  if (!id) {
    return res.status(400).json({ message: "Thiếu ProductID!" });
  }

  // Thay vì SELECT * FROM products
  // Ta JOIN bảng salereport để lấy SalePercent, SalePrice...
  const sql = `
    SELECT 
      p.*,
      sr.SalePercent,
      sr.SalePrice,
      sr.SaleStart,
      sr.SaleEnd
    FROM products p
    LEFT JOIN salesreports sr
      ON p.ProductID = sr.ProductID
      AND sr.SaleStart <= NOW()
      AND sr.SaleEnd >= NOW()
    WHERE p.ProductID = ?
    LIMIT 1
  `;

  try {
    console.log("🔄 Đang chạy query...");

    // Với mysql2/promise, pool.query trả về [rows, fields]
    const [rows] = await pool.query(sql, [id]);

    // Kiểm tra rows rỗng
    if (!rows || rows.length === 0) {
      console.warn(`⚠️ Không tìm thấy sản phẩm với ID ${id}`);
      return res.status(404).json({ message: "Sản phẩm không tồn tại!" });
    }

    console.log("✅ Lấy sản phẩm thành công:", rows[0]);
    return res.status(200).json({
      success: true,
      data: rows, 
      // hoặc chỉ trả rows[0] nếu bạn muốn 1 object
    });
  } catch (error) {
    console.error("❌ Lỗi khi lấy sản phẩm:", error);
    return res
      .status(500)
      .json({ message: "Lỗi server!", error: error.message });
  }
};
//sửa sản phẩm
const productcartDetail = async (req, res) => {
  const { id } = req.params;
  console.log(`🟢 Nhận request với ProductID: ${id}`);

  if (!id) {
    return res.status(400).json({ message: "Thiếu ProductID!" });
  }

  const sql = "SELECT * FROM products WHERE ProductID = ?";

  try {
    console.log("🔄 Đang chạy query...");

    // MySQL2 trả về [rows, fields], cần destructure [rows]
    const [rows] = await pool.query(sql, [id]);

    if (!rows || rows.length === 0) {
      console.warn(`⚠️ Không tìm thấy sản phẩm với ID ${id}`);
      return res.status(404).json({ message: "Sản phẩm không tồn tại!" });
    }

    // rows[0] là bản ghi sản phẩm
    let product = rows[0];

    // Nếu cột Color là chuỗi "Đỏ, Xanh, Đen" thì tách ra thành mảng
    if (product.Color) {
      product.colors = product.Color.split(",").map((c) => c.trim());
    } else {
      product.colors = []; // hoặc null, tùy ý
    }

    // Nếu cột Size là chuỗi "S, M, L" thì tách ra thành mảng
    if (product.Size) {
      product.sizes = product.Size.split(",").map((s) => s.trim());
    } else {
      product.sizes = [];
    }

    console.log("✅ Lấy sản phẩm thành công:", product);
    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("❌ Lỗi khi lấy sản phẩm:", error);
    return res.status(500).json({ message: "Lỗi server!", error: error.message });
  }
};
const deleteProduct = async (req, res) => {
    const { productid } = req.params; // Lấy productid từ URL

    if (!productid) {
        return res.status(400).json({ message: "Lỗi: Thiếu productId" });
    }

    try {
        const [rows] = await pool.execute("SELECT * FROM products WHERE ProductID = ?", [productid]);

        if (rows.length === 0) {
            return res.status(404).json({ message: "Sản phẩm không tồn tại" });
        }

        await pool.execute("DELETE FROM products WHERE ProductID = ?", [productid]);
        return res.status(200).json({ message: "Sản phẩm đã được xóa thành công" });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Lỗi server" });
    }
};
const updateProduct = async (req, res) => {
  const { id } = req.params;
  const {
    Name,
    Description,
    Price,
    Gender,
    Size,
    Color,
    Stock,
    CategoryID,
    ImageURL, // Trường này sẽ chứa chuỗi tên ảnh cũ được giữ lại (ví dụ: "old1.jpg,old2.jpg")
  } = req.body;

  // Chuyển chuỗi ảnh cũ thành mảng
  let selectedImages = ImageURL ? ImageURL.split(",").filter((x) => x) : [];

  // Lấy tên file của ảnh mới upload từ req.files (nếu có)
  let newImageFilenames = [];
  if (req.files && req.files.length > 0) {
    newImageFilenames = req.files.map((file) => file.filename);
  }

  // Nối mảng các ảnh cũ được giữ lại và ảnh mới upload
  let finalImageArray = [...selectedImages, ...newImageFilenames];
  let finalImageURL = finalImageArray.join(",");

  try {
    const [result] = await pool.execute(
      `UPDATE products
       SET Name = ?, Description = ?, Price = ?, Gender = ?, Size = ?, 
           Color = ?, Stock = ?, CategoryID = ?, ImageURL = ?
       WHERE ProductID = ?`,
      [
        Name,
        Description,
        Price,
        Gender,
        Size,
        Color,
        Stock,
        CategoryID,
        finalImageURL,
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Không có sản phẩm nào được cập nhật!" });
    }

    return res.json({
      success: true,
      message: "Cập nhật sản phẩm thành công!",
      imageURL: finalImageURL, // Trả về chuỗi ảnh đã cập nhật
    });
  } catch (error) {
    console.error("❌ Lỗi cập nhật sản phẩm:", error);
    return res.status(500).json({
      message: "Lỗi máy chủ",
      error: error.message,
    });
  }
};

//bình luận
const getreViews = async (req , res) =>{
   try {
    const { id } = req.params;
    const query = `
      SELECT
        r.ReviewID      AS reviewid,
        r.ProductID     AS productid,
        r.CustomerID    AS customerid,
        r.Rating        AS rating,
        r.Comment       AS comment,
        r.CreatedAt     AS createdat,
        c.FullName      AS customername,
        c.ProfilePicture AS customeravatar
      FROM reviews r
      JOIN customers c ON r.CustomerID = c.CustomerID
      WHERE r.ProductID = ?
      ORDER BY r.ReviewID DESC
    `;
    const [rows] = await pool.query(query, [id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
const createReview = async (req , res)  =>{
  try {
    const { ProductID, CustomerID, Rating, Comment } = req.body;
    
    // Bước 1: Thêm review mới
    const insertQuery = `
      INSERT INTO reviews (ProductID, CustomerID, Rating, Comment)
      VALUES (?, ?, ?, ?)
    `;
    const [insertResult] = await pool.query(insertQuery, [ProductID, CustomerID, Rating, Comment]);
    const newReviewId = insertResult.insertId; // ID của review vừa chèn

    // Bước 2: Lấy review vừa chèn, JOIN customers để có FullName + ProfilePicture
    const selectQuery = `
      SELECT r.ReviewID,
             r.ProductID,
             r.CustomerID,
             r.Rating,
             r.Comment,
             r.CreatedAt,
             c.FullName AS customername,
             c.ProfilePicture AS customeravatar
      FROM reviews r
      JOIN customers c ON r.CustomerID = c.CustomerID
      WHERE r.ReviewID = ?
    `;
    const [reviewRows] = await pool.query(selectQuery, [newReviewId]);

    if (reviewRows.length > 0) {
      // Trả về object review vừa thêm, kèm thông tin user
      res.json(reviewRows[0]);
    } else {
      res.status(404).json({ error: "Review not found after insert" });
    }
  } catch (err) {
    console.error('Error in POST /reviews:', err);
    res.status(500).json({ error: err.message });
  }
}
const updateReview = async (req , res) =>{
  const { reviewId } = req.params;          // Lấy reviewId từ URL
  const { customerId, rating, comment } = req.body; // Lấy customerId, rating, comment từ body

  // Kiểm tra rating phải từ 1 đến 5
  if (rating < 1 || rating > 5) {
    return res
      .status(400)
      .json({ success: false, message: "Rating phải từ 1 đến 5 sao." });
  }

  const sql = `
    UPDATE reviews 
    SET Rating = ?, Comment = ? 
    WHERE ReviewID = ? AND CustomerID = ?
  `;
  pool.query(sql, [rating, comment, reviewId, customerId], (err, result) => {
    if (err) {
      console.error("Lỗi khi sửa review:", err);
      return res.status(500).json({ success: false, message: "Server error" });
    }
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy review hoặc không có quyền sửa" });
    }
    return res.json({
      success: true,
      message: "Sửa review thành công!",
    });
  });
}
const deleteReview = async (req,res) =>{
  const { reviewId } = req.params;         // Lấy reviewId từ URL
  const { customerId } = req.body;           // Lấy customerId từ body

  const sql = `
    DELETE FROM reviews
    WHERE ReviewID = ? AND CustomerID = ?
  `;
  pool.query(sql, [reviewId, customerId], (err, result) => {
    if (err) {
      console.error("Lỗi khi xóa review:", err);
      return res.status(500).json({ success: false, message: "Server error" });
    }
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy review hoặc không có quyền xóa" });
    }
    return res.json({
      success: true,
      message: "Xóa review thành công!",
    });
  });
}
const getReviewByID = async (req , res) =>{
  const { customerId } = req.params;
  const sql = `SELECT * FROM reviews WHERE CustomerID = ?`;
  pool.query(sql, [customerId], (err, results) => {
    if (err) {
      console.error("Lỗi khi lấy bình luận theo CustomerID:", err);
      return res.status(500).json({ success: false, message: "Server error" });
    }
    return res.json({ success: true, data: results });
  });
}
//giỏ hàng
const addtoCart = async (req, res) => {
    const { customerId, productId, quantity, color, size } = req.body;

    if (!customerId || !productId || !quantity || quantity <= 0) {
        return res.status(400).json({ message: 'Thông tin đầu vào không hợp lệ' });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Kiểm tra sản phẩm tồn tại và kiểm tra tồn kho
        let [product] = await connection.query('SELECT Stock FROM products WHERE ProductID = ?', [productId]);
        if (product.length === 0) {
            throw new Error('Sản phẩm không tồn tại');
        }

        if (product[0].Stock < quantity) {
            throw new Error('Không đủ hàng trong kho');
        }

        // Kiểm tra giỏ hàng của khách hàng
        let [cart] = await connection.query('SELECT CartID FROM cart WHERE CustomerID = ?', [customerId]);
        let cartId;

        if (cart.length === 0) {
            let [result] = await connection.query(
                'INSERT INTO cart (CustomerID, CreatedAt, UpdatedAt) VALUES (?, NOW(), NOW())',
                [customerId]
            );
            cartId = result.insertId;
        } else {
            cartId = cart[0].CartID;
        }

        // Kiểm tra sản phẩm đã có trong giỏ hàng chưa
        let [cartItem] = await connection.query(
            'SELECT CartItemID, Quantity FROM cartitems WHERE CartID = ? AND ProductID = ? AND Color = ? AND Size = ?',
            [cartId, productId, color, size]
        );

        if (cartItem.length > 0) {
            // Nếu đã có, cập nhật số lượng
            await connection.query(
                'UPDATE cartitems SET Quantity = Quantity + ? WHERE CartItemID = ?',
                [quantity, cartItem[0].CartItemID]
            );
        } else {
            // Nếu chưa có, thêm mới vào CartItem
            await connection.query(
                'INSERT INTO cartitems (CartID, ProductID, Quantity, Color, Size) VALUES (?, ?, ?, ?, ?)',
                [cartId, productId, quantity, color, size]
            );
        }

        await connection.commit();
        res.json({ message: 'Thêm sản phẩm vào giỏ hàng thành công' });
    } catch (error) {
        await connection.rollback();
        console.error("Lỗi khi thêm vào giỏ hàng:", error);
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    } finally {
        connection.release();
    }
};
const getCart = async (req, res) => {
  const { customerId } = req.params;

    if (!customerId) {
        return res.status(400).json({ message: 'Thiếu customerId' });
    }

    const connection = await pool.getConnection();
    try {
        const [cart] = await connection.query(
            'SELECT CartID FROM cart WHERE CustomerID = ?',
            [customerId]
        );

        if (cart.length === 0) {
            return res.json({ message: 'Giỏ hàng trống', cartItems: [] });
        }

        const cartId = cart[0].CartID;

        const [cartItems] = await connection.query(
            `SELECT ci.CartItemID, ci.ProductID, ci.Quantity, ci.Color, ci.Size,
                    p.Name, p.Price, p.ImageURL
             FROM cartitems ci
             JOIN products p ON ci.ProductID = p.ProductID
             WHERE ci.CartID = ?`,
            [cartId]
        );

        res.json({ cartItems });
    } catch (error) {
        console.error("Lỗi khi lấy giỏ hàng:", error);
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    } finally {
        connection.release();
    }
}
const reMoveItem = async (req, res) => {
    const { customerId, productId } = req.params;

    if (!customerId || !productId) {
        return res.status(400).json({ message: 'Thiếu customerId hoặc productId' });
    }

    const connection = await pool.getConnection();
    try {
        // Lấy CartID từ bảng Cart
        const [cart] = await connection.query(
            'SELECT CartID FROM cart WHERE CustomerID = ?',
            [customerId]
        );

        if (cart.length === 0) {
            return res.status(404).json({ message: 'Giỏ hàng không tồn tại' });
        }

        const cartId = cart[0].CartID;

        // Xóa sản phẩm khỏi giỏ hàng
        const [result] = await connection.query(
            'DELETE FROM cartitems WHERE CartID = ? AND ProductID = ?',
            [cartId, productId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Sản phẩm không tồn tại trong giỏ hàng' });
        }

        res.json({ message: 'Xóa sản phẩm khỏi giỏ hàng thành công' });
    } catch (error) {
        console.error("Lỗi khi xóa sản phẩm khỏi giỏ hàng:", error);
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    } finally {
        connection.release();
    }
};
const updateCartItem = async (req, res) => {
  const { customerId, productId } = req.params;
  let { color, size, quantity } = req.body;  // có thể chỉ 1 trong 3 trường

  if (!customerId || !productId) {
    return res.status(400).json({ message: "Thiếu customerId hoặc productId" });
  }

  // Không để số lượng <= 0
  if (quantity !== undefined && quantity <= 0) {
    quantity = 1;
  }

  const connection = await pool.getConnection();
  try {
    // 1) Lấy CartID
    const [cart] = await connection.query(
      "SELECT CartID FROM cart WHERE CustomerID = ?",
      [customerId]
    );
    if (cart.length === 0) {
      return res.status(404).json({ message: "Giỏ hàng không tồn tại" });
    }
    const cartId = cart[0].CartID;

    // 2) Kiểm tra CartItem
    const [cartItem] = await connection.query(
      "SELECT * FROM cartitems WHERE CartID = ? AND ProductID = ?",
      [cartId, productId]
    );
    if (cartItem.length === 0) {
      return res.status(404).json({ message: "Sản phẩm không có trong giỏ hàng" });
    }

    // 3) Tạo câu lệnh UPDATE linh hoạt (partial update)
    const fields = [];
    const values = [];

    // Nếu frontend gửi "color", thêm vào câu lệnh
    if (color !== undefined) {
      fields.push("Color = ?");
      values.push(color);
    }
    // Nếu gửi "size"
    if (size !== undefined) {
      fields.push("Size = ?");
      values.push(size);
    }
    // Nếu gửi "quantity"
    if (quantity !== undefined) {
      fields.push("Quantity = ?");
      values.push(quantity);
    }

    // Nếu không có trường nào cần update
    if (fields.length === 0) {
      return res.status(400).json({ message: "Không có dữ liệu để cập nhật" });
    }

    // 4) Thực hiện UPDATE
    const sql = `UPDATE cartitems SET ${fields.join(", ")} WHERE CartID = ? AND ProductID = ?`;
    values.push(cartId, productId);

    await connection.query(sql, values);

    res.json({ message: "Cập nhật sản phẩm thành công" });
  } catch (error) {
    console.error("Lỗi khi cập nhật sản phẩm:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  } finally {
    connection.release();
  }
};
//sale
const getSale = async (req, res) => {
  try {
    const { productID } = req.params;

    const [rows] = await pool.query(
      `SELECT * FROM salesreports
       WHERE ProductID = ? LIMIT 1`,
      [productID]
    );

    if (rows.length === 0) {
      return res.json({
        success: false,
        message: "Chưa có sale cho sản phẩm này",
      });
    }

    res.json({
      success: true,
      sale: rows[0],
    });
  } catch (error) {
    console.error("Lỗi khi lấy sale:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
// 1) Tạo sale (POST /api/v1/salesreports)
const saleProduct = async (req, res) => {
  try {
    const { productID, salePercent, salePrice, saleStart, saleEnd } = req.body;

    if (!productID) {
      return res.status(400).json({
        success: false,
        message: "Thiếu productID",
      });
    }

    // Thực hiện INSERT
    const [result] = await pool.query(
      `INSERT INTO salesreports (ProductID, SalePercent, SalePrice, SaleStart, SaleEnd)
       VALUES (?, ?, ?, ?, ?)`,
      [
        productID,
        salePercent || 0,
        salePrice || 0,
        saleStart || null,
        saleEnd || null,
      ]
    );

    // Lấy lại row vừa tạo, để trả về cho frontend (nếu cần)
    const [rows] = await pool.query(
      `SELECT * FROM salesreports WHERE ReportID = ? LIMIT 1`,
      [result.insertId]
    );
    const newSale = rows.length > 0 ? rows[0] : null;

    return res.json({
      success: true,
      message: "Tạo sale thành công",
      sale: newSale, // Trả về sale vừa tạo
    });
  } catch (error) {
    console.error("Lỗi khi tạo sale:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// 2) Sửa sale (PUT /api/v1/salesreports/:productID)
const updateSaleProduct = async (req, res) => {
  try {
    const { productID } = req.params;
    const { salePercent, salePrice, saleStart, saleEnd } = req.body;

    // Thực hiện UPDATE
    const [result] = await pool.query(
      `UPDATE salesreports
       SET SalePercent = ?, SalePrice = ?, SaleStart = ?, SaleEnd = ?
       WHERE ProductID = ?`,
      [
        salePercent || 0,
        salePrice || 0,
        saleStart || null,
        saleEnd || null,
        productID,
      ]
    );

    // affectedRows = 0 => không tìm thấy dòng nào để UPDATE
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sale để cập nhật",
      });
    }

    // Lấy lại row vừa UPDATE để trả về cho client
    const [rows] = await pool.query(
      `SELECT * FROM salesreports WHERE ProductID = ? LIMIT 1`,
      [productID]
    );
    const updatedSale = rows.length > 0 ? rows[0] : null;

    return res.json({
      success: true,
      message: "Cập nhật sale thành công",
      sale: updatedSale, // Trả về sale vừa sửa
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật sale:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

const getSaleProductByID = async (req, res) => {
  try {
    const { productID } = req.params;

    // Truy vấn tìm sale của productID
    const [rows] = await pool.query(
      "SELECT * FROM salesreports WHERE ProductID = ? LIMIT 1",
      [productID]
    );

    // Nếu không có sale cho product này
    if (rows.length === 0) {
      // Thay vì trả về 404 (dẫn tới frontend nhảy vào catch),
      // ta trả về 200 + success = false để frontend xử lý logic
      return res.status(200).json({
        success: false,
        sale: null,
        message: "Không tìm thấy sale cho sản phẩm này",
      });
    }

    // Nếu có sale
    return res.json({
      success: true,
      sale: rows[0],
    });
  } catch (error) {
    console.error("Lỗi khi lấy sale:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi máy chủ khi lấy thông tin sale",
    });
  }
};

// 3) Xóa sale (DELETE /api/v1/salesreports/:productID)
const deleteSaleProduct = async (req, res) => {
  try {
    const { productID } = req.params;

    const [result] = await pool.query(
      `DELETE FROM salesreports
       WHERE ProductID = ?`,
      [productID]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sale để xóa",
      });
    }

    return res.json({
      success: true,
      message: "Xóa sale thành công",
      productID, // có thể trả về ID vừa xóa để frontend xử lý
    });
  } catch (error) {
    console.error("Lỗi khi xóa sale:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
const productWithSale = async (req, res) => {
  try {
    const { categoryID } = req.query; // Lấy tham số categoryID từ query string
    let query = `
      SELECT 
        p.*,
        sr.SalePercent,
        sr.SalePrice,
        sr.SaleStart,
        sr.SaleEnd
      FROM products p
      LEFT JOIN salesreports sr
        ON p.ProductID = sr.ProductID
        AND sr.SaleStart <= NOW()
        AND sr.SaleEnd >= NOW()
    `;
    const params = [];

    // Nếu có truyền categoryID thì thêm điều kiện WHERE
    if (categoryID) {
      query += " WHERE p.CategoryID = ?";
      params.push(categoryID);
    }

    const [rows] = await pool.query(query, params);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error("Lỗi khi lấy sản phẩm kèm sale:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const productWithCat = async (req, res) => {
  try {
    // Lấy giá trị type từ route params
    const { type } = req.params;

    if (type === 'quan') {
      // Nếu type là 'quan' thì chỉ lấy sản phẩm có CategoryID = 1
      const [rows] = await pool.query(`
        SELECT *
        FROM products
        WHERE CategoryID = 1
      `);

      return res.json({ success: true, data: rows });
    } else {
      // Nếu không phải 'quan' thì giữ nguyên logic cũ (sản phẩm kèm sale)
      const [rows] = await pool.query(`
        SELECT 
          p.*,
          sr.SalePercent,
          sr.SalePrice,
          sr.SaleStart,
          sr.SaleEnd
        FROM products p
        LEFT JOIN salesreports sr
          ON p.ProductID = sr.ProductID
          AND sr.SaleStart <= NOW()
          AND sr.SaleEnd >= NOW()
      `);

      return res.json({ success: true, data: rows });
    }
  } catch (error) {
    console.error("Lỗi khi lấy sản phẩm kèm sale:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};




const searchProduct = async (req, res) => {
  const { name } = req.query;
    if (!name) {
        return res.status(400).json({ error: 'Tên sản phẩm không được để trống' });
    }
    
    try {
        const query = `SELECT * FROM products WHERE LOWER(name) LIKE LOWER(?)`;
        const [rows] = await pool.query(query, [`%${name}%`]);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Lỗi máy chủ' });
    }
};

//api đặt hàng
// const apiOders = async (req, res) => {
//   const {
//     customerId,
//     items,             // Mảng { productId, quantity, price, chosenColor, chosenSize }
//     totalAmount,
//     paymentMethod,
//     customerEmail,
//     shippingAddress,   // Chứa { locationName, phone, address, country }
//   } = req.body;

//   // Kiểm tra input
//   if (!customerId || !items || !items.length || !paymentMethod) {
//     return res.status(400).json({ error: 'Thiếu dữ liệu đơn hàng' });
//   }

//   if (!shippingAddress) {
//     return res.status(400).json({ error: 'Thiếu địa chỉ giao hàng' });
//   }

//   const connection = await pool.getConnection();
//   try {
//     await connection.beginTransaction();

//     // 1️⃣ **Thêm đơn hàng, bao gồm locationName**
//     const [orderResult] = await connection.query(
//       `INSERT INTO orders
//          (CustomerID, TotalAmount, PaymentMethod, OrderStatus,
//           ShippingName, ShippingPhone, ShippingAddress, ShippingCountry)
//        VALUES (?, ?, ?, 'dang_xu_ly', ?, ?, ?, ?)`,
//       [
//         customerId,
//         totalAmount,
//         paymentMethod,
//         shippingAddress.locationName,  // Thêm locationName
//         shippingAddress.phone,
//         shippingAddress.address,
//         shippingAddress.country,
//       ]
//     );
//     const newOrderId = orderResult.insertId;

//     // 2️⃣ **Thêm từng sản phẩm vào orderdetails + cập nhật bảng products**
//     for (const item of items) {
//       const { productId, quantity, price, chosenColor, chosenSize } = item;

//       await connection.query(
//         `INSERT INTO orderdetails
//            (OrderID, ProductID, Quantity, Price, chosen_color, chosen_size)
//          VALUES (?, ?, ?, ?, ?, ?)`,
//         [newOrderId, productId, quantity, price, chosenColor, chosenSize]
//       );

//       await connection.query(
//         `UPDATE products
//          SET SalesCount = SalesCount + ?,
//              Stock = Stock - ?
//          WHERE ProductID = ?`,
//         [quantity, quantity, productId]
//       );
//     }

//     // 3️⃣ **Commit transaction**
//     await connection.commit();
//     connection.release();

//     // 4️⃣ **Gửi email cảm ơn (hiển thị locationName)**
//     if (paymentMethod === 'cod') {
//       const subject = 'Cảm ơn bạn đã đặt hàng (COD)';
//       const htmlContent = `
//         <h3>Chào bạn,</h3>
//         <p>Cảm ơn bạn đã đặt hàng tại cửa hàng chúng tôi.</p>
//         <p>Tổng số tiền cần thanh toán khi nhận hàng: <strong>${totalAmount} VNĐ</strong>.</p>
//         <p>Chúng tôi sẽ giao hàng sớm nhất có thể.</p>
//         <p><b>Người nhận:</b> ${shippingAddress.locationName} <br/>
//            <b>Số điện thoại:</b> ${shippingAddress.phone} <br/>
//            <b>Địa chỉ:</b> ${shippingAddress.address},${shippingAddress.locationName}, ${shippingAddress.country}
//         </p>
//         <p>Trân trọng,<br/>Shop Gela</p>
//       `;
//       await sendEmail(customerEmail, subject, htmlContent);
//     } else {
//       const subject = 'Cảm ơn bạn đã đặt hàng (Online)';
//       const htmlContent = `
//         <h3>Chào bạn,</h3>
//         <p>Cảm ơn bạn đã đặt hàng và thanh toán online thành công.</p>
//         <p>Tổng số tiền bạn đã thanh toán: <strong>${totalAmount} VNĐ</strong>.</p>
//         <p>Chúng tôi sẽ giao hàng sớm nhất có thể.</p>
//         <p><b>Người nhận:</b> ${shippingAddress.locationName} <br/>
//            <b>Số điện thoại:</b> ${shippingAddress.phone} <br/>
//            <b>Địa chỉ:</b> ${shippingAddress.address}, ${shippingAddress.country},${shippingAddress.locationName}
//         </p>
//         <p>Trân trọng,<br/>Shop Gela</p>
//       `;
//       await sendEmail(customerEmail, subject, htmlContent);
//     }

//     return res.json({
//       message: 'Tạo đơn hàng thành công',
//       orderId: newOrderId,
//     });
//   } catch (error) {
//     await connection.rollback();
//     connection.release();
//     console.error('Lỗi khi tạo đơn hàng:', error);
//     return res.status(500).json({ error: 'Có lỗi xảy ra khi tạo đơn hàng' });
//   }
// };
const apiOders = async (req, res) => {
  const {
    customerId,
    items,             // Mảng { productId, quantity, price, chosenColor, chosenSize }
    totalAmount,
    paymentMethod,
    customerEmail,     // <-- Đây chính là email của địa chỉ mặc định được gửi từ frontend
    shippingAddress,   // Chứa { locationName, phone, address, country }
  } = req.body;

  // Kiểm tra input
  if (!customerId || !items || !items.length || !paymentMethod) {
    return res.status(400).json({ error: 'Thiếu dữ liệu đơn hàng' });
  }

  if (!shippingAddress) {
    return res.status(400).json({ error: 'Thiếu địa chỉ giao hàng' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1️⃣ Thêm đơn hàng
    const [orderResult] = await connection.query(
      `INSERT INTO orders
         (CustomerID, TotalAmount, PaymentMethod, OrderStatus,
          ShippingName, ShippingPhone, ShippingAddress, ShippingCountry)
       VALUES (?, ?, ?, 'dang_xu_ly', ?, ?, ?, ?)`,
      [
        customerId,
        totalAmount,
        paymentMethod,
        shippingAddress.locationName,
        shippingAddress.phone,
        shippingAddress.address,
        shippingAddress.country,
      ]
    );
    const newOrderId = orderResult.insertId;

    // 2️⃣ Thêm từng sản phẩm vào orderdetails + cập nhật bảng products
    for (const item of items) {
      const { productId, quantity, price, chosenColor, chosenSize } = item;

      await connection.query(
        `INSERT INTO orderdetails
           (OrderID, ProductID, Quantity, Price, chosen_color, chosen_size)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [newOrderId, productId, quantity, price, chosenColor, chosenSize]
      );

      await connection.query(
        `UPDATE products
         SET SalesCount = SalesCount + ?,
             Stock = Stock - ?
         WHERE ProductID = ?`,
        [quantity, quantity, productId]
      );
    }

    // 3️⃣ Commit transaction
    await connection.commit();
    connection.release();

    // 4️⃣ Lấy tên khách hàng (FullName) từ bảng customers
    const [customerRows] = await pool.query(
      `SELECT FullName FROM customers WHERE CustomerID = ?`,
      [customerId]
    );
    const customerFullName =
      customerRows && customerRows.length
        ? customerRows[0].FullName
        : shippingAddress.locationName;

    // 5️⃣ Gửi email cảm ơn (dùng customerEmail)
    const subjectCOD = 'Cảm ơn bạn đã đặt hàng (COD)';
    const subjectOnline = 'Cảm ơn bạn đã đặt hàng (Online)';
    
    if (paymentMethod === 'cod') {
      const htmlContent = `
        <h3>Chào bạn,</h3>
        <p>Cảm ơn bạn đã đặt hàng tại cửa hàng chúng tôi.</p>
        <p>Tổng số tiền cần thanh toán khi nhận hàng: <strong>${totalAmount} VNĐ</strong>.</p>
        <p>Chúng tôi sẽ giao hàng sớm nhất có thể.</p>
        <p><b>Người nhận:</b> ${customerFullName} <br/>
           <b>Số điện thoại:</b> ${shippingAddress.phone} <br/>
           <b>Địa chỉ:</b> ${shippingAddress.address}, ${shippingAddress.locationName},${shippingAddress.country}
        </p>
        <p>Trân trọng,<br/>Shop Gela</p>
      `;
      await sendEmail(customerEmail, subjectCOD, htmlContent);
    } else {
      const htmlContent = `
        <h3>Chào bạn,</h3>
        <p>Cảm ơn bạn đã đặt hàng và thanh toán online thành công.</p>
        <p>Tổng số tiền bạn đã thanh toán: <strong>${totalAmount} VNĐ</strong>.</p>
        <p>Chúng tôi sẽ giao hàng sớm nhất có thể.</p>
        <p><b>Người nhận:</b> ${customerFullName} <br/>
           <b>Số điện thoại:</b> ${shippingAddress.phone} <br/>
           <b>Địa chỉ:</b> ${shippingAddress.address}, ${shippingAddress.country}, ${shippingAddress.locationName}
        </p>
        <p>Trân trọng,<br/>Shop Gela</p>
      `;
      await sendEmail(customerEmail, subjectOnline, htmlContent);
    }

    return res.json({
      message: 'Tạo đơn hàng thành công',
      orderId: newOrderId,
    });
  } catch (error) {
    await connection.rollback();
    connection.release();
    console.error('Lỗi khi tạo đơn hàng:', error);
    return res.status(500).json({ error: 'Có lỗi xảy ra khi tạo đơn hàng' });
  }
};

const getOrders = async (req, res) => {
  try {
    // 1) Lấy danh sách đơn hàng kèm thông tin khách hàng
    const [orders] = await pool.query(`
      SELECT 
        o.*,
        c.FullName AS CustomerName,
        c.ProfilePicture AS CustomerImage,
        -- Lấy thêm các trường shipping
        o.ShippingName,
        o.ShippingPhone,
        o.ShippingAddress,
        o.ShippingCountry
      FROM orders o
      JOIN customers c ON o.CustomerID = c.CustomerID
      ORDER BY o.OrderID DESC
    `);

    // 2) Với mỗi đơn hàng, lấy danh sách sản phẩm đã đặt
    for (let order of orders) {
      const [items] = await pool.query(`
        SELECT 
          p.ProductID,
          p.Name AS Name,
          p.ImageURL,
          oi.Quantity,
          oi.Price,
          oi.chosen_color AS Color,
          oi.chosen_size AS Size
        FROM orderdetails oi
        JOIN products p ON oi.ProductID = p.ProductID
        WHERE oi.OrderID = ?
      `, [order.OrderID]);

      order.items = items; // Gắn danh sách sản phẩm vào order
    }

    return res.json(orders);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách đơn hàng:', error);
    return res.status(500).json({ message: 'Có lỗi xảy ra khi lấy danh sách đơn hàng.' });
  }
};

const getOderbyID = async (req, res) => {
  const { customerID } = req.params;
  console.log("customerID param on server:", customerID); // debug

  try {
    const [orders] = await pool.query(`
      SELECT 
        o.OrderID,
        o.CustomerID,
        o.TotalAmount,
        o.OrderStatus,
        o.PaymentMethod,
        o.CreatedAt,
        c.FullName AS CustomerName
      FROM orders o
      JOIN customers c ON o.CustomerID = c.CustomerID
      WHERE o.CustomerID = ?
      ORDER BY o.OrderID DESC
    `, [customerID]);

    if (orders.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng cho khách hàng này.' });
    }

    for (let order of orders) {
      const [details] = await pool.query(`
        SELECT 
          p.Name,
          p.ImageURL,
          od.Quantity,
          od.Price,
          od.chosen_color AS Color,
          od.chosen_size  AS Size
        FROM orderdetails od
        JOIN products p ON od.ProductID = p.ProductID
        WHERE od.OrderID = ?
      `, [order.OrderID]);
      order.details = details;
    }

    return res.json(orders);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách đơn hàng theo CustomerID:', error);
    return res.status(500).json({ message: 'Có lỗi xảy ra khi lấy danh sách đơn hàng.' });
  }
};


const updateOrder = async (req, res) => {
  const { orderID } = req.params;
  const { orderStatus } = req.body;
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Validate orderStatus
    const validStatuses = ['dang_xu_ly', 'dang_giao', 'da_giao', 'da_huy'];
    if (!validStatuses.includes(orderStatus)) {
      await connection.rollback();
      connection.release();
      return res.status(400).json({ message: 'Trạng thái đơn hàng không hợp lệ.' });
    }

    // Log received orderID for debugging
    console.log("Received orderID:", orderID);

    // Fetch current order status
    const [[oldOrder]] = await connection.query(
      'SELECT OrderStatus FROM orders WHERE OrderID = ?',
      [orderID]
    );

    if (!oldOrder) {
      console.log("Order not found for ID:", orderID);
      await connection.rollback();
      connection.release();
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng để cập nhật.' });
    }

    const oldStatus = oldOrder.OrderStatus || 'dang_xu_ly'; // Default to 'dang_xu_ly' if NULL
    console.log('oldStatus:', oldStatus, '-> newStatus:', orderStatus);

    // Update order status
    const [result] = await connection.query(
      'UPDATE orders SET OrderStatus = ? WHERE OrderID = ?',
      [orderStatus, orderID]
    );

    if (result.affectedRows === 0) {
      console.log("No rows updated for orderID:", orderID);
      await connection.rollback();
      connection.release();
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng để cập nhật.' });
    }

    // Fetch order details for stock update
    const [orderDetails] = await connection.query(
      'SELECT ProductID, Quantity FROM OrderDetails WHERE OrderID = ?',
      [orderID]
    );

    // Update stock and sales count if transitioning to 'dang_giao'
    if (oldStatus === 'dang_xu_ly' && orderStatus === 'dang_giao') {
      for (const detail of orderDetails) {
        // Check stock availability
        const [[product]] = await connection.query(
          'SELECT Stock FROM products WHERE ProductID = ?',
          [detail.ProductID]
        );
        if (product.Stock < detail.Quantity) {
          await connection.rollback();
          connection.release();
          return res.status(400).json({ message: `Sản phẩm ${detail.ProductID} không đủ hàng trong kho.` });
        }

        await connection.query(
          `UPDATE products
           SET SalesCount = SalesCount + ?,
               Stock = Stock - ?
           WHERE ProductID = ?`,
          [detail.Quantity, detail.Quantity, detail.ProductID]
        );
      }
    }

    await connection.commit();
    connection.release();
    return res.json({ message: 'Cập nhật trạng thái đơn hàng thành công!' });
  } catch (error) {
    await connection.rollback();
    connection.release();
    console.error('Lỗi khi cập nhật đơn hàng:', error);
    return res.status(500).json({ message: 'Có lỗi xảy ra khi cập nhật đơn hàng.', error: error.message });
  }
};




//api sau khi đặt hàng sẽ xóa sản phẩm khỏi giỏ hàng
const clearCart = async (req, res) => {
   try {
    // 1) Lấy customerId từ route param
    const { customerId } = req.params;  // chú ý: param phải tên :customerId
    // 2) Lấy productIds từ body
    const { productIds } = req.body;    // mảng các ProductID cần xóa

    // 3) Kiểm tra tính hợp lệ
    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ error: "Danh sách productIds không hợp lệ" });
    }

    console.log("Xóa cart theo productIds:", { customerId, productIds });

    // 4) Thực hiện DELETE trong bảng cart
    // Thông qua JOIN cartitems => cartitems.CartID = cart.CartID
    // Chỉ xóa dòng cart nếu cart.CustomerID=? và cartitems.ProductID IN (?)
    const [result] = await pool.query(
      `DELETE cartitems
FROM cartitems
JOIN cart ON cartitems.CartID = cart.CartID
WHERE cart.CustomerID = ?
  AND cartitems.ProductID IN (?)
`,
      [customerId, productIds]
    );

    console.log("Kết quả DELETE:", result);

    return res.json({
      message: "Đã xóa dòng trong bảng cart (chứa sản phẩm đã thanh toán)",
      affectedRows: result.affectedRows,
    });
  } catch (error) {
    console.error("Lỗi khi xóa sản phẩm đã thanh toán trong bảng cart:", error);
    return res.status(500).json({ error: "Có lỗi xảy ra khi xóa sản phẩm" });
  }
};

//địa chỉ
const getAddress = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM shippingaddresses');
    res.json(rows);
  } catch (error) {
    console.error('Lỗi GET /addresses:', error);
    res.status(500).json({ error: 'Có lỗi xảy ra khi lấy danh sách địa chỉ' });
  }
}
const getAddressbyID = async (req, res) => {
  const { customerId } = req.params;
  try {
    // PHẢI có WHERE CustomerID = ?
    const [rows] = await pool.query(
      "SELECT * FROM shippingaddresses WHERE CustomerID = ?",
      [customerId]
    );
    res.json(rows);
  } catch (error) {
    console.error("Lỗi khi lấy địa chỉ:", error);
    res.status(500).json({ error: "Có lỗi xảy ra khi lấy địa chỉ" });
  }
}
const createAddress = async (req, res) => {
  try {
    const {
      CustomerID,
      LocationName,
      Email,
      Phone,
      Address,
      Country
    } = req.body;

    const [result] = await pool.query(
      `INSERT INTO shippingaddresses
      (CustomerID, LocationName, Email, Phone, Address, Country)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [CustomerID, LocationName, Email, Phone, Address, Country]
    );

    res.json({
      message: 'Thêm địa chỉ thành công',
      insertedId: result.insertId
    });
  } catch (error) {
    console.error('Lỗi POST /addresses:', error);
    res.status(500).json({ error: 'Có lỗi xảy ra khi thêm địa chỉ' });
  }
}
const updateAddress = async (req, res) => {
  const addressId = req.params.id;
  try {
    // Lấy dữ liệu từ body (chỉ các trường muốn cập nhật)
    const {
      LocationName,
      Email,
      Phone,
      Address,
      Country
      // Nếu muốn giữ ZipCode, IsPickupAddress, v.v. 
      // bạn có thể lấy từ body hoặc bỏ qua tuỳ nhu cầu
    } = req.body;

    // Kiểm tra xem AddressID có tồn tại không
    const [check] = await pool.query(
      'SELECT * FROM shippingaddresses WHERE AddressID = ?',
      [addressId]
    );
    if (check.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy địa chỉ với ID đã cho' });
    }

    // Câu lệnh UPDATE KHÔNG cập nhật CustomerID => giữ nguyên
    await pool.query(
      `UPDATE shippingaddresses
       SET LocationName = ?,
           Email = ?,
           Phone = ?,
           Address = ?,
           Country = ?
       WHERE AddressID = ?`,
      [LocationName, Email, Phone, Address, Country, addressId]
    );

    res.json({ message: 'Cập nhật địa chỉ thành công' });
  } catch (error) {
    console.error('Lỗi PUT /address/:id:', error);
    res.status(500).json({ error: 'Có lỗi xảy ra khi cập nhật địa chỉ' });
  }
}
const deleteAddress = async (req, res) => {
 const addressId = req.params.addressId; // Nhận AddressID từ URL
  try {
    // Kiểm tra địa chỉ có tồn tại không
    const [check] = await pool.query('SELECT * FROM shippingaddresses WHERE AddressID = ?', [addressId]);
    if (check.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy địa chỉ với AddressID đã cho' });
    }

    // Xóa địa chỉ theo AddressID
    await pool.query('DELETE FROM shippingaddresses WHERE AddressID = ?', [addressId]);
    res.json({ message: 'Xóa địa chỉ thành công' });
  } catch (error) {
    console.error('Lỗi DELETE /addresses/:addressId:', error);
    res.status(500).json({ error: 'Có lỗi xảy ra khi xóa địa chỉ' });
  }
}
const setDefaultAddress = async (req, res) => {
  const { customerId } = req.params;
  const { addressId } = req.body;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Bước 1: Đặt tất cả địa chỉ của khách hàng này thành IsPickupAddress = 0
    await connection.query(
      `UPDATE shippingaddresses
       SET IsPickupAddress = 0
       WHERE CustomerID = ?`,
      [customerId]
    );

    // Bước 2: Đặt địa chỉ được chọn thành IsPickupAddress = 1
    await connection.query(
      `UPDATE shippingaddresses
       SET IsPickupAddress = 1
       WHERE AddressID = ? AND CustomerID = ?`,
      [addressId, customerId]
    );

    await connection.commit();
    connection.release();

    return res.json({ message: "Địa chỉ mặc định đã được cập nhật" });
  } catch (error) {
    await connection.rollback();
    connection.release();
    console.error("Lỗi cập nhật địa chỉ mặc định:", error);
    return res.status(500).json({ error: "Lỗi khi cập nhật địa chỉ mặc định" });
  }
};




export default { 
  viewProduct ,addNewProduct,productDetail,getAllCategories,
  deleteProduct,updateProduct,getreViews ,productWithCat,
  createReview,addtoCart,getCart,reMoveItem,
  updateCartItem,productcartDetail,saleProduct,
  updateSaleProduct,deleteSaleProduct,getSale,getSaleProductByID
  ,productWithSale,searchProduct,apiOders 
  ,getOrders,getOderbyID,updateOrder,
  getAddress,getAddressbyID,createAddress,
  updateAddress,deleteAddress,clearCart,setDefaultAddress
  ,updateReview,deleteReview,getReviewByID
 };
