const path = require('path');
const fs = require('fs');
const multer = require('multer');
const imagemin = require('imagemin');
const imageminJPG = require('imagemin-mozjpeg');
const imageminPNG = require('imagemin-pngquant');
const imageminGIF = require('imagemin-gifsicle');
const moment = require('moment');
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
}).array('file', 5);

exports.resizeUserPhoto = catchAsync(async(req, res, next) => {
    if (!req.files) return next();

    for (let [key, value] of Object.entries(req.files)) {
        const fileName = value.originalname.split('.').slice(0, -1).join(' ');
        const date = moment().format('YYYYMMDD-HHmmss');
        const mimeType = value.mimetype.split('/')[1];
        value.filename = `${fileName}-${date}.${mimeType}`;

        let image;
        if (mimeType === 'jpeg') {
            image = await imagemin.buffer(value.buffer, {
                destination: '/public/uploads/',
                plugins: [
                    imageminJPG()
                ]
            });
        } else if (mimeType === 'png') {
            image = await imagemin.buffer(value.buffer, {
                destination: '/public/uploads/',
                plugins: [
                    imageminPNG({
                        quality: [0.6, 0.8]
                    })
                ]
            });
        } else if (mimeType === 'gif') {
            image = await imagemin.buffer(value.buffer, {
                destination: '/public/uploads/',
                plugins: [
                    imageminGIF()
                ]
            });
        }

        const buff = new Buffer.from(image, 'base64');
        value.compressSize = buff.toString().length;
        fs.writeFileSync(path.join(rootPath, 'public', 'uploads', value.filename), buff);
    }
    next();
});

exports.mainController = catchAsync(async(req, res, next) => {
    for (let [key, value] of Object.entries(req.files)) {
        delete value.buffer;
        delete value.encoding;
        value.size = (value.size / 1024 / 1024).toFixed(2) + ' MB';
        value.compressSize = (value.compressSize / 1024 / 1024).toFixed(2) + ' MB';
    }

    res.status(200).json({
        status: 'success',
        data: req.files
    });
});
