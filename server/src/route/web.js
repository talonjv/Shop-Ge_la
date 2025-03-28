import express from 'express';
import homeControler from '../controller/homeControler.js';
import multer from 'multer';
import path from 'path';
import appRoot from 'app-root-path';
let router = express.Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, appRoot + "/src/public/image/");
    },
    // By default, multer removes file extensions so let's add them back
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const imageFilter = function (req, file, cb) {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
        req.fileValidationError = 'Only image files are allowed!';
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};

let upload = multer({ storage: storage, fileFilter: imageFilter });




const initWebroute = (app) => {
    router.get('/', homeControler.getHomePage);
    router.get('/damn', (req, res) => {
        res.send('Hello World');
    });
    // router.post('/createUser',upload.single('profile_pic'),homeControler.createNewuser)
    router.post("/createUser", upload.array("profile_pics",5),homeControler.createNewuser);
    router.post('/delete-user', homeControler.getDeleteuser);
    router.get('/edit-user/:id', homeControler.getEdit);
    router.post('/update-user', homeControler.updateUser);
    router.get('/details/users/:userId', homeControler.getDeteilpage);
    router.get('/login',homeControler.loginUser)
    router.post('/postLogin',homeControler.postLogin)
    router.get('/upload',homeControler.getUpload)
    router.post('/upload-profile-pic', upload.single('profile_pic'), homeControler.uploadFile)
    router.post('/upload-multiple-images',upload.array('multiple_images',10), homeControler.uploadMultipleImages)
    return app.use('/', router);
};

export default initWebroute;