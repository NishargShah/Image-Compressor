const path = require('path');
const multer = require('multer');
const sharp = require('sharp');
const moment = require('moment');
const {rootPath} = require("../utils/helper");
const {AppError, catchAsync} = require('../utils/appError');

const multerFileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new AppError('Not an image! Please upload only images.', 400), false);
    }
};

exports.upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: multerFileFilter
}).single('avatar');

exports.resizeUserPhoto = catchAsync(async(req, res, next) => {
    if (!req.file) return next();

    const fileName = req.file.originalname.split('.').slice(0, -1).join(' ');
    const date = moment().format('YYYYMMDD-HHmmss');
    req.file.filename = `${fileName}-${date}.jpeg`;

    await sharp(req.file.buffer)
        .resize(500, 500)
        .toFormat('jpeg', {})
        .jpeg()
        .toFile(path.join(rootPath, 'public', 'uploads', 'users', req.file.filename));
    next();
});
