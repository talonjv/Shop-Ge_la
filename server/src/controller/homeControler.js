import pool from '../config/connectdb.js';    
import multer from 'multer';

let getHomePage = async (req, res) => {
  
  const [rows , fields] = await pool.execute('SELECT * FROM customers');
     return res.render('index.ejs', {  data: rows });
 
};
let getDeteilpage = async (req, res) => {
  let userId = req.params.userId;
  let [user] = await pool.execute('SELECT * FROM customer WHERE CustomerID = ?', [userId]);
    return res.send(JSON.stringify(user[0]));
};
let uploadFile = async(req,res) =>{
        if (req.fileValidationError) {
            return res.send(req.fileValidationError);
        }
        else if (!req.file) {
            return res.send('Please select an image to upload');
        }
        res.send(`You have uploaded this image: <hr/><img src="/image/${req.file.filename}" width="500"><hr /><a href="/upload">Upload another image</a>`);
    // });
}

// const createNewuser = async (req, res) => {
//     try {
//         let { name, email, phone, password, gender, address, city } = req.body;
//         let profile_pic = req.file ? req.file.filename : null;

//         console.log("Received data:", req.body);
//         console.log("Uploaded file:", req.file);

//         // 🛑 Kiểm tra xem email đã tồn tại chưa
//         const [existingUser] = await pool.execute('SELECT Email FROM Customers WHERE Email = ?', [email]);
//         if (existingUser.length > 0) {
//             return res.status(400).json({ error: "Email already exists!" });
//         }

//         // Thực hiện truy vấn SQL để thêm người dùng mới
//         await pool.execute(
//             'INSERT INTO Customers (Fullname, Email, Phone, PasswordHash, Gender, Address, City, ProfilePicture) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
//             [name, email, phone, password, gender || "Other", address, city, profile_pic]
//         );

//         console.log("User inserted successfully!");
//         return res.redirect('/');
//     } catch (error) {
//         console.error("Error creating user:", error);
//         return res.status(500).json({ error: "Internal Server Error" });
//     }
// };
const createNewuser = async (req, res) => {
    try {
        let { name, email, phone, password, gender, address, city } = req.body;
        
        // Lấy danh sách file ảnh (nếu có)
        let profile_pics = req.files ? req.files.map(file => file.filename) : [];
        
        // Nếu không có ảnh tải lên, gán mặc định 1 ảnh
        if (profile_pics.length === 0) {
            profile_pics.push("default-profile.png");
        }

        console.log("Received data:", req.body);
        console.log("Uploaded files:", profile_pics);

        // Kiểm tra xem email đã tồn tại chưa
        const [existingUser] = await pool.execute(
            'SELECT Email FROM Customers WHERE Email = ?', 
            [email]
        );
        if (existingUser.length > 0) {
            return res.status(400).json({ error: "Email already exists!" });
        }

        // Chuyển danh sách ảnh thành chuỗi JSON để lưu vào MySQL
        const profilePicsJson = JSON.stringify(profile_pics);

        // Thực hiện truy vấn SQL để thêm người dùng mới
        // Chú ý: thêm cột `role` vào INSERT và giá trị `0` ở cuối
        await pool.execute(
            `INSERT INTO Customers 
                (Fullname, Email, Phone, PasswordHash, Gender, Address, City, ProfilePicture, role) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                name,
                email,
                phone,
                password,
                gender || "Other",
                address,
                city,
                profilePicsJson,
                0 // Gán role = 0
            ]
        );

        console.log("User inserted successfully!");
        return res.redirect('/');
    } catch (error) {
        console.error("Error creating user:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};



let editUser = async (req, res) => {
    return res.send('Edit User');
}
let getEdit = async (req, res) => {
  let id = req.params.id;
  let [user] = await pool.execute('SELECT * FROM custome WHERE customers = ?', [id]); 
    return res.render('update.ejs', { dataUser: user[0] });
}
let getDeleteuser = async (req, res) => {
  let userId = req.body.userId;
  await pool.execute('DELETE FROM users WHERE customers = ?', [userId]);
     return res.redirect('/');
}
let updateUser = async (req, res) => {
  let {fname , lname , pass , address , id} = req.body;
  await pool.execute('UPDATE users SET firstname = ?, lastname = ?, password = ?, email = ?, address = ? WHERE customers = ?',
    [fname, lname, email, address , id]);
  console.log(req.body);
  return res.redirect('/');
}
let loginUser  = async (req, res) =>{
      return  res.render('login.ejs');
}
let postLogin = async (req, res) =>{
  let {fname , password} = req.body;
  let [user] = await pool.execute('SELECT * FROM users WHERE firstname = ? AND password = ?', [fname, password]);
  if(user.length > 0){
    return res.redirect('/');
  }else{
    return res.redirect('/login');
  }
}
let logOut = async (req, res) =>{
  req,session.destroy(()=>{
    return res.redirect('/login');
  })
}

let getUpload = async (req, res) =>{
  return res.render('uploadfile.ejs');
}

// const upload = multer().single('profile_pic');


// const uploadMultiple = multer().array('multiple_images',10)
let uploadMultipleImages = async (req, res) => {
// uploadMultiple(req, res, function (err) {
        // req.file contains information of uploaded file
        // req.body contains information of text fields, if there were any
        if (req.fileValidationError) {
            return res.send(req.fileValidationError);
        }
        else if (!req.files) {
            return res.send('Please select an image to upload');
        }
        // Display uploaded image for user validation
        let result = "You have uploaded these images: <hr />";
        const files = req.files;
        console.log(files)
        let index, len;
        // Loop through all the uploaded images and display them on frontend
        for (index = 0, len = files.length; index < len; ++index) {
            result += `<img src="/image/${files[index].filename}" width="300" style="margin-right: 20px;">`;
        }        result += '<hr/><a href="./">Upload more images</a>';
        res.send(result);
    // });
}
export default 
{ getHomePage,getDeteilpage,createNewuser,
  editUser,getEdit,getDeleteuser ,
  updateUser,loginUser,postLogin,logOut,
  getUpload,uploadFile,uploadMultipleImages
};