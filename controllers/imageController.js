const path = require('path');
const fs = require('fs');
const multer = require('multer');
const imagemin = require('imagemin');
const imageminJPG = require('imagemin-mozjpeg');
const imageminPNG = require('imagemin-pngquant');
const imageminGIF = require('imagemin-gifsicle');
const moment = require('moment');
const {filterBody} = require("../utils/helper");
const {rootPath} = require("../utils/helper");
const {AppError, catchAsync} = require('../utils/appError');

const multerFileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/gif') {
        cb(null, true);
    } else {
        cb(new AppError('Not an image! Please upload only images.', 400), false);
    }
};

exports.upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: multerFileFilter
}).single('file');

exports.resizeUserPhoto = catchAsync(async(req, res, next) => {
    if (!req.file) return next();

    const fileName = req.file.originalname.split('.').slice(0, -1).join(' ');
    const date = moment().format('YYYYMMDD-HHmmss');
    const mimeType = req.file.mimetype.split('/')[1];
    req.file.filename = `${fileName}-${date}.${mimeType}`;

    // .gif, .jpg, .jpeg, .png, .mp3, .mp4, .avi, .mov, .pdf
    let image;
    if (mimeType === 'jpeg') {
        image = await imagemin.buffer(req.file.buffer, {
            destination: '/public/uploads/',
            plugins: [
                imageminJPG()
            ]
        });
    } else if (mimeType === 'png') {
        image = await imagemin.buffer(req.file.buffer, {
            destination: '/public/uploads/',
            plugins: [
                imageminPNG({
                    quality: [0.6, 0.8]
                })
            ]
        });
    } else if (mimeType === 'gif') {
        image = await imagemin.buffer(req.file.buffer, {
            destination: '/public/uploads/',
            plugins: [
                imageminGIF()
            ]
        });
    }

    const buff = new Buffer.from(image, 'base64');
    req.file.imageSize = buff.toString().length;
    fs.writeFileSync(path.join(rootPath, 'public', 'uploads', req.file.filename), buff);
    next();
});

exports.mainController = catchAsync(async(req, res, next) => {
    const data = filterBody(req.file, null, null, ['originalname', 'mimetype', 'size', 'filename', 'imageSize']);
    data.beforeSize = (data.size / 1024 / 1024).toFixed(2) + ' MB';
    data.afterSize = (data.imageSize / 1024 / 1024).toFixed(2) + ' MB';
    res.status(200).json({
        status: 'success',
        data
    });
});
