import pool from '../config/connectdb.js';   


let getAlluser = async (req, res) => {
     try {
    const [rows] = await pool.query("SELECT * FROM customers");
    return res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error("Lỗi khi lấy customers:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
let createUser = async (req, res) => {
    try {
    const {
      FullName,
      Email,
      Phone,
      PasswordHash,
      Gender,
      Address,
      District,
      City,
      ZipCode,
      ProfilePicture
    } = req.body;

    // Kiểm tra các trường bắt buộc (tùy nhu cầu)
    if (!FullName || !Email || !PasswordHash) {
      return res.status(400).json({
        success: false,
        message: "Thiếu FullName, Email hoặc PasswordHash"
      });
    }

    const [result] = await pool.query(
      `INSERT INTO customers 
      (FullName, Email, Phone, PasswordHash, Gender, Address, District, City, ZipCode, ProfilePicture, CreatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        FullName,
        Email,
        Phone || null,
        PasswordHash,
        Gender || null,
        Address || null,
        District || null,
        City || null,
        ZipCode || null,
        ProfilePicture || null
      ]
    );

    return res.json({
      success: true,
      message: "Tạo customer thành công",
      customerID: result.insertId
    });
  } catch (error) {
    console.error("Lỗi khi tạo customer:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
let deleteUser = async (req, res) => {
      try {
    const { customerID } = req.params;

    const [result] = await pool.query(
      `DELETE FROM customers
       WHERE CustomerID = ?`,
      [customerID]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy customer để xóa" });
    }

    return res.json({
      success: true,
      message: "Xóa customer thành công"
    });
  } catch (error) {
    console.error("Lỗi khi xóa customer:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
const updateUser = async (req, res) => {
  try {
    const { customerID } = req.params;
    const {
      FullName,
      Email,
      Phone,
      PasswordHash, // Có thể cập nhật nếu cần
      Gender,
      Address,
      District,
      City,
      ZipCode,
      ProfilePicture
    } = req.body;

    // Tạo mảng updateFields
    // Ở đây ví dụ: update hết cột, tùy ý
    const [result] = await pool.query(
      `UPDATE customers
       SET 
         FullName = ?, 
         Email = ?, 
         Phone = ?, 
         PasswordHash = ?, 
         Gender = ?, 
         Address = ?, 
         District = ?, 
         City = ?, 
         ZipCode = ?, 
         ProfilePicture = ?
       WHERE CustomerID = ?`,
      [
        FullName || null,
        Email || null,
        Phone || null,
        PasswordHash || null,
        Gender || null,
        Address || null,
        District || null,
        City || null,
        ZipCode || null,
        ProfilePicture || null,
        customerID
      ]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy customer để cập nhật" });
    }

    return res.json({
      success: true,
      message: "Cập nhật customer thành công"
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật customer:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

let searchUser = async (req, res) => {
  let { search } = req.body;

  if (!search || search.trim() === "") {
    return res.status(400).json({ error: "Vui lòng nhập từ khóa tìm kiếm" });
  }

  try {
    // Sử dụng LOWER() để tìm kiếm không phân biệt chữ hoa/chữ thường
    let query = `
      SELECT * FROM customers
      WHERE CONCAT_WS( ' ',full) LIKE ?`;
    let [users] = await pool.execute(query, [`${search.toLowerCase()}%`]);

    if (users.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy user nào" });
    }

    return res.json(users);
  } catch (error) {
    console.error("Lỗi truy vấn:", error);
    return res.status(500).json({ error: "Lỗi server" });
  }

   
};

export default { 
    getAlluser , createUser,updateUser,deleteUser,
    searchUser
 }