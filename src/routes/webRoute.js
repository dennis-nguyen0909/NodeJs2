import express from 'express'
import homeController from '../controllers/homeController';
import multer from 'multer';
import path from 'path'
var appRoot = require("app-root-path")
const router = express.Router();

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
let upload1 = multer({ storage: storage, fileFilter: imageFilter }).array('multiple_images', 4);
const initRoutes = (app) => {
    router.get('/', homeController.homePage);
    router.get('/about', homeController.aboutPage);
    router.get('/detail/user/:id', homeController.detailUser);
    router.get('/pageCreate', homeController.createPage);
    router.post('/create-user', homeController.createUser);
    router.post('/delete-user', homeController.deleteUser);
    router.get('/edit-user/:id', homeController.editPage);
    router.post('/edit-user', homeController.editUser);

    router.get('/upload', homeController.uploadFilePage);
    router.post('/upload-profile-pic', upload.single('profile_pic'), homeController.handleUploadFile);
    router.post('/upload-multiple-images', (req, res, next) => {
        upload1(req, res, (err) => {
            if (err instanceof multer.MulterError && err.code === "LIMIT_UNEXPECTED_FILE") {
                // handle multer file limit error here
                res.send('LIMIT_UNEXPECTED_FILE:Vui lòng không tải quá nhiều ảnh cho phép!')
            } else if (err) {
                res.send(err)
            }

            else {
                // make sure to call next() if all was well
                next();
            }
        })
    }, homeController.handleUploadMultipleFile)
    return app.use('/', router);
}

export default initRoutes;