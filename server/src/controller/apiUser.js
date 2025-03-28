import pool from '../config/connectdb.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import session from "express-session";
import transporter from '../middleware/mailer.js';
import crypto from 'crypto';

const SECRET_KEY = process.env.JWT_SECRET || "supersecretkey";
let apiLogin = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Hãy nhập email và password" });
  }

  try {
    // 1. Tìm user trong bảng customers
    let [results] = await pool.query("SELECT * FROM customers WHERE Email = ?", [email]);
    let user = results.length ? results[0] : null;
    let isCustomer = true; // Cờ đánh dấu là khách hàng
    // 2. Nếu không tìm thấy trong customers, thì tìm tiếp trong admins
    if (!user) {
      [results] = await pool.query("SELECT * FROM admins WHERE Email = ?", [email]);
      user = results.length ? results[0] : null;
      isCustomer = false; // Cờ đánh dấu là admin
    }

    // 3. Nếu không thấy ở cả hai bảng => 401
    if (!user) {
      return res.status(401).json({ message: "Email hoặc mật khẩu không đúng" });
    }

    // 4. Lấy passwordHash từ DB
    const storedPassword = user.PasswordHash;
    let isMatch = false;

    // Kiểm tra bcrypt
    if (storedPassword.startsWith("$2b$") || storedPassword.startsWith("$2a$")) {
      isMatch = await bcrypt.compare(password, storedPassword);
    } else {
      // Nếu chưa mã hoá thì so sánh trực tiếp
      isMatch = password === storedPassword;
    }

    if (!isMatch) {
      return res.status(401).json({ message: "Email hoặc mật khẩu sai" });
    }

    // 5. Xác định role (giả sử customers.role và admins.Role)
    // Tuỳ theo cột của bạn, có thể là "role" hoặc "Role"
    let role;
    if (isCustomer) {
      // Mặc định 0 là customer, có thể parseInt(user.role) nếu cột DB là `role`
      role = user.role || "Customer";
    } else {
      // Mặc định 1 là admin, cột DB `Role`
      role = user.Role || "Admin";
    }
    // 6. Tạo token
    const token = jwt.sign(
      {
        id: isCustomer ? user.CustomerID : user.AdminID,
        email: user.Email,
        role: role,
      },
      "SECRET_KEY", // nên dùng biến .env thay cho "SECRET_KEY"
      { expiresIn: "1h" }
    );

    req.session.user = {
      id: isCustomer ? user.CustomerID : user.AdminID,
      fullName: user.FullName,
      email: user.Email,
      phone: user.Phone,
      role: role, // chuỗi
      profilePicture: user.ProfilePicture
    };

    console.log("🟢 Đăng nhập thành công:", req.session.user);
    // 8. Trả về client
    return res.json({
      message: "Đăng nhập thành công",
      user: req.session.user,
      token: token,
    });

  } catch (error) {
    console.error("❌ Lỗi server:", error);
    return res.status(500).json({ message: "Lỗi server", error });
  }
};
let apiLogOut = async (req,res) =>{
  req.session.destroy();
  res.json({ message: "Đăng xuất thành công" });
}
let apiCheck = async (req , res) =>{
if (req.session.user) {
    return res.json({ loggedIn: true, user: req.session.user });
  } else {
    return res.json({ loggedIn: false, message: "Chưa đăng nhập" });
  }
}
// api user
const apigetCustomer = async (req, res) => {
  try {
    // pool.query() trả về [rows, fields]
    const [results] = await pool.query('SELECT * FROM customers');
    return res.json({ data: results });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Lỗi server' });
  }
}
const apigetUpdateCustomer = async (req, res) => {
  const customerId = req.params.id;

  pool.query('SELECT * FROM customers WHERE CustomerID = ?', [customerId], (error, results) => {
    if (error) {
      console.error(error);
      return res.status(500).json({ error: 'Lỗi server' });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy customer' });
    }
    return res.json(results[0]);
  });
}
const apiUpdateCustomer = async (req, res) => {
  const customerId = req.params.id;
  
  // Lấy dữ liệu từ body (trừ ảnh)
  const { FullName, Email, Phone, PasswordHash, Gender, Address, District, City, ZipCode } = req.body;

  // Nếu có file ảnh mới, lấy tên file
  const ProfilePicture = req.file ? req.file.filename : null;

  // Câu lệnh SQL cập nhật
  let sql = `
    UPDATE customers 
    SET FullName = ?, Email = ?, Phone = ?, PasswordHash = ?, Gender = ?, 
        Address = ?, District = ?, City = ?, ZipCode = ?
  `;

  const params = [FullName, Email, Phone, PasswordHash, Gender, Address, District, City, ZipCode];

  // Nếu có ảnh mới, thêm vào SQL
  if (ProfilePicture) {
    sql += `, ProfilePicture = ?`;
    params.push(ProfilePicture);
  }

  sql += ` WHERE CustomerID = ?`;
  params.push(customerId);

  pool.query(sql, params, (error, result) => {
    if (error) {
      console.error(error);
      return res.status(500).json({ error: "Lỗi server" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Không tìm thấy khách hàng để cập nhật" });
    }
    return res.json({ message: "Cập nhật thành công" });
  });
}
const apidelCustomer = async (req, res) => {
  const customerId = req.params.id;

  pool.query('DELETE FROM customers WHERE CustomerID = ?', [customerId], (error, result) => {
    if (error) {
      console.error(error);
      return res.status(500).json({ error: 'Lỗi server' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không tìm thấy customer để xóa' });
    }
    return res.json({ message: 'Xóa thành công' });
  });
}
const viewProfile = async (req, res) => {
  try {
    const customerId = req.params.id;

    // Kiểm tra customerId có hợp lệ không (chỉ cho phép số)
    if (!customerId || isNaN(customerId)) {
      return res.status(400).json({ error: "ID khách hàng không hợp lệ" });
    }

    const sql = "SELECT * FROM customers WHERE CustomerID = ?";
    
    // Sử dụng pool với promise
    const [rows] = await pool.query(sql, [customerId]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy khách hàng" });
    }

    let customer = rows[0];

    // Xử lý ProfilePicture thành URL đầy đủ
    customer.ProfilePicture = customer.ProfilePicture
      ? `http://localhost:2000/image/${customer.ProfilePicture}`
      : `http://localhost:2000/image/default.jpg`; // Ảnh mặc định nếu null

    res.json(customer); // Trả về thông tin khách hàng
  } catch (error) {
    console.error("Lỗi truy vấn database:", error);
    res.status(500).json({ error: "Lỗi truy vấn database" });
  }
};
const changeProfile = async (req, res) => {
  try {
    // Kiểm tra request có nhận params & body không
    console.log("🟢 API nhận request:", req.params, req.body);

    // Lấy customerId từ params
    const customerId = req.params.customerId; 
    if (!customerId) {
      return res.status(400).json({ message: "Thiếu customerId!" });
    }

    // Lấy dữ liệu từ body
    const { FullName, Email, Phone, Gender, Address, District } = req.body;
    if (!FullName || !Email || !Phone) {
      return res.status(400).json({ message: "Thiếu dữ liệu cập nhật!" });
    }

    // Kiểm tra khách hàng có tồn tại không
    const [customer] = await pool.query("SELECT * FROM customers WHERE customerId = ?", [customerId]);
    console.log("🔍 Kiểm tra khách hàng:", customer);

    if (!customer || customer.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy khách hàng!" });
    }

    // Cập nhật thông tin
    const [result] = await pool.query(
      "UPDATE customers SET FullName = ?, Email = ?, Phone = ?, Gender = ?, Address = ?, District = ? WHERE customerId = ?",
      [FullName, Email, Phone, Gender, Address, District, customerId]
    );

    if (result.affectedRows === 0) {
      return res.status(500).json({ message: "Không thể cập nhật khách hàng!" });
    }

    console.log("✅ Cập nhật thành công!");
    res.json({ message: "Cập nhật thông tin thành công!" });
  } catch (error) {
    console.error("🚨 Lỗi cập nhật khách hàng:", error);
    res.status(500).json({ message: "Lỗi máy chủ!" });
  }
};
const changeAvatar = async (req, res) => {
  try {
    const { customerId } = req.params;

    console.log("📩 File nhận được:", req.file); // Log thông tin file
    console.log("📌 Customer ID:", customerId); // Log ID khách hàng

    if (!req.file) {
      return res.status(400).json({ message: "Vui lòng chọn tệp ảnh!" });
    }

    // Kiểm tra khách hàng có tồn tại không
    const [customer] = await pool.query("SELECT * FROM customers WHERE customerId = ?", [customerId]);
    if (!customer.length) {
      return res.status(404).json({ message: "Không tìm thấy khách hàng!" });
    }

    // Chỉ lưu TÊN FILE vào database
    const fileName = req.file.filename;
    await pool.query("UPDATE customers SET ProfilePicture = ? WHERE customerId = ?", [fileName, customerId]);

    res.json({ 
      message: "✅ Cập nhật ảnh đại diện thành công!", 
      ProfilePicture: fileName  // Trả về chỉ tên file, không có localhost
    });
  } catch (error) {
    console.error("❌ Lỗi upload ảnh:", error);
    res.status(500).json({ message: "Lỗi máy chủ!", error: error.message });
  }
};
// const regisTer = async (req, res) => {
//   try {
//     const { fullName, email, phone, password, gender } = req.body;

//     if (!fullName || !email || !phone || !password || !gender) {
//       return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin" });
//     }

//     let [existingUsers] = await pool.execute("SELECT * FROM customers WHERE Email = ?", [email]);

//     if (existingUsers.length > 0) {
//       return res.status(400).json({ message: "Email đã tồn tại" });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);
//     // Đường dẫn ảnh mặc định trong thư mục public/images
//     const defaultAvatar = `db1.png`;

//     const sql = `INSERT INTO customers (FullName, Email, Phone, PasswordHash, Gender, ProfilePicture) 
//                  VALUES (?, ?, ?, ?, ?, ?)`;

//     let [result] = await pool.execute(sql, [fullName, email, phone, hashedPassword, gender, defaultAvatar]);

//     res.status(201).json({ message: "Đăng ký thành công", userId: result.insertId });

//   } catch (error) {
//     console.error("Lỗi đăng ký:", error);
//     res.status(500).json({ message: "Lỗi server" });
//   }
// };
const regisTer = async (req, res) => {
  try {
    const { fullName, email, phone, password, gender } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!fullName || !email || !phone || !password || !gender) {
      return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin" });
    }

    // Kiểm tra email đã tồn tại chưa
    let [existingUsers] = await pool.execute(
      "SELECT * FROM customers WHERE Email = ?", 
      [email]
    );
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: "Email đã tồn tại" });
    }

    // Mã hoá mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Ảnh mặc định
    const defaultAvatar = "ph.jpg";

    // INSERT user mới, gán role = 0
    const sql = `
      INSERT INTO customers (
        FullName, 
        Email, 
        Phone, 
        PasswordHash, 
        Gender, 
        ProfilePicture, 
        role
      ) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    let [result] = await pool.execute(sql, [
      fullName, 
      email, 
      phone, 
      hashedPassword, 
      gender, 
      defaultAvatar, 
      0
    ]);

    return res.status(201).json({ 
      message: "Đăng ký thành công", 
      userId: result.insertId 
    });
  } catch (error) {
    console.error("Lỗi đăng ký:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};
const apiOTP = async (req, res) => {
  const { email } = req.body;

  try {
    // Kiểm tra email có tồn tại không
    const [rows] = await pool.query("SELECT * FROM customers WHERE Email = ?", [email]);

    if (rows.length === 0) {
      return res.status(400).json({ message: "Email không tồn tại trong hệ thống" });
    }

    // Tạo OTP 6 chữ số
    const otp = crypto.randomInt(100000, 999999).toString();

    // Tạo JWT chứa OTP và email, hết hạn sau 5 phút
    const otpToken = jwt.sign({ email, otp }, SECRET_KEY, { expiresIn: "10m" });


    // Gửi email chứa OTP Token
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Mã xác thực OTP - Đặt lại mật khẩu",
      text: `Mã OTP của bạn là: ${otp}. OTP này sẽ hết hạn sau 5 phút. 
      Để xác thực, hãy gửi OTP kèm theo token này: ${otpToken}`,
    });

    res.json({ message: "OTP đã được gửi đến email của bạn", otpToken });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
}
const resetPassword = async (req, res) => {
  const { email, otp, otpToken } = req.body;

  try {
    // Giải mã JWT để lấy OTP
    let decoded;
    try {
      decoded = jwt.verify(otpToken, SECRET_KEY);
    } catch (err) {
      return res.status(400).json({ message: "OTP đã hết hạn hoặc không hợp lệ" });
    }

    // Kiểm tra email có khớp với email trong token không
    if (decoded.email !== email) {
      return res.status(400).json({ message: "Email không hợp lệ" });
    }

    // Kiểm tra OTP có khớp không
    if (decoded.otp !== otp) {
      return res.status(400).json({ message: "OTP không hợp lệ" });
    }

    // Tạo mật khẩu mới ngẫu nhiên
    const newPassword = crypto.randomBytes(6).toString("hex");
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Cập nhật mật khẩu mới trong database
    await pool.query("UPDATE customers SET PasswordHash = ? WHERE Email = ?", [hashedPassword, email]);

    // Gửi mật khẩu mới qua email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Mật khẩu mới của bạn",
      text: `Mật khẩu mới của bạn là: ${newPassword}. Vui lòng đăng nhập và đổi mật khẩu ngay!`,
    });

    res.json({ message: "Mật khẩu mới đã được gửi đến email của bạn" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
const reVenueDaily = async (req, res) =>{
  try {
    const [rows] = await pool.query(
      `SELECT DATE(CreatedAt) as date, SUM(TotalAmount) as revenue 
       FROM orders WHERE OrderStatus != 'da_huy' 
       GROUP BY DATE(CreatedAt) ORDER BY date;`
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
const reVenueMonthly = async (req, res) =>{
   try {
    const [rows] = await pool.query(
      `SELECT YEAR(CreatedAt) as year, MONTH(CreatedAt) as month, SUM(TotalAmount) as revenue 
       FROM orders WHERE OrderStatus != 'da_huy' 
       GROUP BY year, month ORDER BY year, month;`
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
const reVenueQuarterly = async (req, res) =>{
      try {
    const [rows] = await pool.query(
      `SELECT YEAR(CreatedAt) as year, QUARTER(CreatedAt) as quarter, SUM(TotalAmount) as revenue 
       FROM orders WHERE OrderStatus != 'da_huy' 
       GROUP BY year, quarter ORDER BY year, quarter;`
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const apiSetting = async (req, res) => {
  try {
    if (req.fileValidationError) {
      return res.status(400).json({ error: req.fileValidationError });
    }

    const { linkFB, shopname, linkIG } = req.body;
    const bannerFiles = req.files?.banner || [];
    const slideFiles = req.files?.slide || [];

    // Lấy tên file (filename) thay vì full path
    const bannerFileName = bannerFiles.length > 0 ? bannerFiles[0].filename : null;
    const slideFileNames = slideFiles.map(file => file.filename);

    const conn = await pool.getConnection();
    console.log("Inserting:", {
      banner: bannerFileName,
      slide: JSON.stringify(slideFileNames),
      linkFB,
      shopname,
      linkIG
    });

    const [result] = await conn.query(
      `INSERT INTO setting (banner, slide, linkFB, shopname, linkIG)
       VALUES (?, ?, ?, ?, ?)`,
      [
        bannerFileName,
        slideFileNames.length > 0 ? JSON.stringify(slideFileNames) : null,
        linkFB || null,
        shopname || null,
        linkIG || null,
      ]
    );
    conn.release();

    return res.json({
      message: "Tạo setting thành công",
      settingID: result.insertId,
    });
  } catch (error) {
    console.error("Error in apiSetting:", error);
    return res.status(500).json({ error: "Lỗi khi tạo setting" });
  }
};

 const getSetting = async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.query("SELECT * FROM setting");
    conn.release();

    const data = rows.map(row => {
      let slideArray = [];
      if (row.slide) {
        try {
          slideArray = JSON.parse(row.slide);
        } catch (e) {
          console.error(`Error parsing slide for settingID ${row.settingID}:`, e);
          slideArray = [];
        }
      }
      return {
        settingID: row.settingID,
        Banner: row.banner,
        Slide: slideArray,
        linkFB: row.linkFB,
        Shopname: row.shopname,
        linkIG: row.linkIG,
      };
    });

    return res.json(data);
  } catch (error) {
    console.error("Error in getSetting:", error);
    return res.status(500).json({ error: "Lỗi khi lấy danh sách setting" });
  }
};
const apiGetSetById = async (req, res) => {
  try {
    const { id } = req.params;
    const conn = await pool.getConnection();
    const [rows] = await conn.query("SELECT * FROM setting WHERE settingID = ?", [id]);
    conn.release();

    if (rows.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy setting" });
    }

    const setting = rows[0];
    let slideArray = [];
    if (setting.slide) {
      try {
        slideArray = JSON.parse(setting.slide);
      } catch (e) {
        console.error(`Error parsing slide for settingID ${setting.settingID}:`, e);
        slideArray = [];
      }
    }

    return res.json({
      settingID: setting.settingID,
      banner: setting.banner,
      slide: slideArray,
      linkFB: setting.linkFB,
      shopname: setting.shopname,
      linkIG: setting.linkIG,
    });
  } catch (error) {
    console.error("Error in apiGetSetById:", error);
    return res.status(500).json({ error: "Lỗi khi lấy setting" });
  }
};
const apiUpdateseting = async (req, res) => {
  try {
    if (req.fileValidationError) {
      return res.status(400).json({ error: req.fileValidationError });
    }
    const { id } = req.params;
    const { linkFB, shopname, linkIG } = req.body;
    const bannerFiles = req.files?.banner || [];
    const slideFiles = req.files?.slide || [];

    // Sử dụng filename để lưu tên file mới
    const newBannerFileName = bannerFiles.length > 0 ? bannerFiles[0].filename : null;
    const newSlideFileNames = slideFiles.map(file => file.filename);

    const conn = await pool.getConnection();
    const [rows] = await conn.query("SELECT * FROM setting WHERE settingID = ?", [id]);
    if (rows.length === 0) {
      conn.release();
      return res.status(404).json({ error: "Không tìm thấy setting" });
    }
    const oldSetting = rows[0];
    const oldBanner = oldSetting.banner;
    const oldSlide = oldSetting.slide ? JSON.parse(oldSetting.slide) : [];

    let finalBanner = oldBanner;
    if (newBannerFileName) {
      // Nếu cần xóa file cũ vật lý, bạn có thể lấy đường dẫn đầy đủ dựa vào tên file (nếu lưu file theo đường dẫn cố định)
      // Ví dụ: đường dẫn upload: appRoot + "/src/public/image/"
      const oldBannerPath = oldBanner ? `src/public/image/${oldBanner}` : null;
      if (oldBannerPath && fs.existsSync(oldBannerPath)) {
        fs.unlinkSync(oldBannerPath);
      }
      finalBanner = newBannerFileName;
    }

    let finalSlide = oldSlide;
    if (newSlideFileNames.length > 0) {
      oldSlide.forEach(fileName => {
        const oldSlidePath = `src/public/image/${fileName}`;
        if (fs.existsSync(oldSlidePath)) {
          fs.unlinkSync(oldSlidePath);
        }
      });
      finalSlide = newSlideFileNames;
    }

    await conn.query(
      `UPDATE setting
       SET banner = ?, slide = ?, linkFB = ?, shopname = ?, linkIG = ?
       WHERE settingID = ?`,
      [
        finalBanner,
        finalSlide.length > 0 ? JSON.stringify(finalSlide) : null,
        linkFB || null,
        shopname || null,
        linkIG || null,
        id,
      ]
    );
    conn.release();

    return res.json({ message: "Cập nhật setting thành công" });
  } catch (error) {
    console.error("Error in apiUpdateseting:", error);
    return res.status(500).json({ error: "Lỗi khi cập nhật setting" });
  }
};

const apiDeletesetting = async (req, res) => {
  try {
    const { id } = req.params;
    const conn = await pool.getConnection();
    const [rows] = await conn.query("SELECT * FROM setting WHERE settingID = ?", [id]);
    if (rows.length === 0) {
      conn.release();
      return res.status(404).json({ error: "Không tìm thấy setting" });
    }

    const setting = rows[0];
    const banner = setting.banner;
    let slide = [];
    if (setting.slide) {
      try {
        slide = JSON.parse(setting.slide);
      } catch (e) {
        console.error(`Error parsing slide for settingID ${setting.settingID}:`, e);
      }
    }

    await conn.query("DELETE FROM setting WHERE settingID = ?", [id]);
    conn.release();

    if (banner && fs.existsSync(banner)) {
      fs.unlinkSync(banner);
    }
    slide.forEach(filePath => {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });

    return res.json({ message: "Xóa setting thành công" });
  } catch (error) {
    console.error("Error in apiDeletesetting:", error);
    return res.status(500).json({ error: "Lỗi khi xóa setting" });
  }
};


  const createAdmin = async (req, res) =>{
    try {
    const { FullName, Email, Phone, PasswordHash, AccessLevel, Role } = req.body;
    let profilePicPath = null;

    // Nếu có file upload, lưu tên file vào biến profilePicPath
    if (req.file) {
      profilePicPath = req.file.filename; 
    }

    const sql = `
      INSERT INTO admins 
      (FullName, Email, Phone, PasswordHash, AccessLevel, ProfilePicture, Role, CreatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    `;
    const [result] = await pool.query(sql, [
      FullName,
      Email,
      Phone,
      PasswordHash,
      AccessLevel,
      profilePicPath,
      Role,
    ]);

    res.json({ success: true, insertedId: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
  }
  const getAdmin = async (req , res) =>{
       try {
    const [rows] = await pool.query('SELECT * FROM admins');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
  }
  const getAdminByID = async (req,res) =>{
    try {
    const [rows] = await pool.query('SELECT * FROM admins WHERE AdminID = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Admin not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
  }
  const updateAdmin = async (req,res) =>{
      try {
    const { FullName, Email, Phone, PasswordHash, AccessLevel, Role } = req.body;
    let profilePicPath = null;

    if (req.file) {
      profilePicPath = req.file.filename;
    }

    // Nếu có file mới, cập nhật ProfilePicture, nếu không thì giữ nguyên
    if (profilePicPath) {
      const sqlUpdate = `
        UPDATE admins SET
          FullName = ?, 
          Email = ?, 
          Phone = ?, 
          PasswordHash = ?,
          AccessLevel = ?, 
          ProfilePicture = ?, 
          Role = ?
        WHERE AdminID = ?
      `;
      await pool.query(sqlUpdate, [
        FullName,
        Email,
        Phone,
        PasswordHash,
        AccessLevel,
        profilePicPath,
        Role,
        req.params.id,
      ]);
    } else {
      // Không upload file mới => không cập nhật ProfilePicture
      const sqlUpdateNoFile = `
        UPDATE admins SET
          FullName = ?, 
          Email = ?, 
          Phone = ?, 
          PasswordHash = ?,
          AccessLevel = ?, 
          Role = ?
        WHERE AdminID = ?
      `;
      await pool.query(sqlUpdateNoFile, [
        FullName,
        Email,
        Phone,
        PasswordHash,
        AccessLevel,
        Role,
        req.params.id,
      ]);
    }

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
  }
  const deleteAdmin = async (req , res) =>{
    try {
    await pool.query('DELETE FROM admins WHERE AdminID = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
  }

export default { 
  apiLogin,regisTer,apiLogOut,
  apiCheck,apiOTP,resetPassword,
  viewProfile,changeProfile,changeAvatar
  ,apigetCustomer,apigetUpdateCustomer 
  ,apiUpdateCustomer,apidelCustomer,
  reVenueDaily,reVenueMonthly,reVenueQuarterly,
  apiSetting,getSetting,apiGetSetById,apiUpdateseting
  ,apiDeletesetting,createAdmin,getAdmin
  ,getAdminByID ,updateAdmin,deleteAdmin
  
 };

