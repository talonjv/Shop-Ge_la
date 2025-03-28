import mysql from 'mysql2/promise';

// Tạo pool kết nối MySQL
const pool = mysql.createPool({
    host: process.env.DB_HOST ,
    user: process.env.DB_USER ,
   //  password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'shop_gela',
    port: process.env.DB_PORT || 3306, // Mặc định MySQL chạy trên cổng 3306
    waitForConnections: true,
    connectionLimit: 1000,
    queueLimit: 0,
   
});

// Kiểm tra kết nối
pool.getConnection()
    .then(connection => {
        console.log('✅ Kết nối MySQL thành công!');
        connection.release(); // Giải phóng kết nối
    })
    .catch(error => {
        console.error('❌ Lỗi kết nối MySQL:', error);
    });

export default pool;
