const path = require('path');
const fs = require('fs');
const multer = require('multer');
const imagemin = require('imagemin');
const convertApi = require('convertapi')(process.env.CONVERT_API_SECRET);
const imageminJPG = require('imagemin-mozjpeg');
const imageminPNG = require('imagemin-pngquant');
const imageminGIF = require('imagemin-gifsicle');
const moment = require('moment');
const archiver = require('archiver');
const {rootPath} = require("../utils/helper");
const {AppError, catchAsync} = require('../utils/appError');

const multerFileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/gif' || file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new AppError('Not an image! Please upload only images.', 400), false);
    }
};

exports.upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: multerFileFilter
}).array('file', 5);

exports.resizeUserPhoto = catchAsync(async(req, res, next) => {
    if (!req.files) return next();
    let archive;

    // ZIP
    if (req.files.length !== 1) {
        const zipDate = moment().format('YYYYMMDD-HHmmss');
        req.zip = `zip-${zipDate}.zip`;
        const output = fs.createWriteStream(path.join(rootPath, 'public', 'uploads', req.zip));
        archive = archiver('zip', {
            zlib: { level: 9 }
        });

        archive.on('error', () => {
            return next(new AppError('Something went wrong in creating zip', 500));
        });

        archive.pipe(output);
    }

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

        if (mimeType === 'jpeg' || mimeType === 'png' || mimeType === 'gif') {
            const buff = new Buffer.from(image, 'base64');
            if (req.files.length !== 1) {
                const bufferZip = Buffer.from(image);
                archive.append(bufferZip, { name: value.originalname });
            }
            value.compressSize = buff.toString().length;
            fs.writeFileSync(path.join(rootPath, 'public', 'uploads', value.filename), buff);
        } else if (mimeType === 'pdf') {
            const buff = new Buffer.from(value.buffer, 'base64');
            fs.writeFileSync(path.join(rootPath, 'public', 'uploads', value.filename), buff);

            const result = await convertApi.convert('compress', {
                File: path.join(rootPath, 'public', 'uploads', value.filename),
                StoreFile: true
            }, 'pdf');

            if (req.files.length !== 1) {
                // noinspection JSCheckFunctionSignatures
                archive.append(fs.createReadStream(path.join(rootPath, 'public', 'uploads', value.filename)), { name: value.originalname });
            }

            value.compressSize = result.response.Files[0].FileSize;
            await result.saveFiles(`./public/uploads/${value.filename}`);
        }
    }
    if (req.files.length !== 1) {
        archive.finalize();
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
    const zipName = (req.files.length !== 1) ? req.zip : undefined;

    res.status(200).json({
        status: 'success',
        data: req.files,
        zipName
    });
});
