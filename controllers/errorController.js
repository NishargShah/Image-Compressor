const chalk = require('chalk');
const {AppError} = require('../utils/appError');
const {NODE_ENV} = process.env;

const handleCastErrorDB = err => new AppError(`Invalid ${err.path}: ${err.value}`, 400);

const handleValidationErrorDB = err => {
    const errors = Object.values(err.errors).map(cur => cur.message);
    return new AppError(errors, 400);
};

const sendErrorDev = (err, req, res) => {
    // A) API
    if (req.originalUrl.startsWith('/api')) {
        return res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack
        });
    }
    // B) RENDERED WEBSITE
    console.error(chalk.blue('Development Error'));
    console.error(chalk.red('ERROR 💥 ') + ' | ' + chalk.cyan(err.message));
    return res.status(err.statusCode).render('error', {
        title: 'Something went wrong!',
        message: err.message
    });
};

const sendErrorProd = (err, req, res) => {
    // A) API
    if (req.originalUrl.startsWith('/api')) {
        // OPERATIONAL ERROR OR TRUSTED ERROR, SEND BY PROGRAMMER
        if (err.isOperational) {
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message
            });
        }
        // PROGRAMMING OR OTHER UNKNOWN ERROR: SO DONT LEAK IT, BE CAREFUL
        console.error(chalk.blue('Production Operational Error'));
        console.error(chalk.red('ERROR 💥 ') + ' | ' + chalk.cyan(err.message));
        return res.status(500).json({
            status: 'Unknown Error',
            message: 'Something went very wrong!'
        });
    }

    // B) RENDERED WEBSITE
    // OPERATIONAL ERROR OR TRUSTED ERROR, SEND BY PROGRAMMER
    if (err.isOperational) {
        return res.status(err.statusCode).render('error', {
            title: 'Something went wrong!',
            message: err.message
        });
    }
    // PROGRAMMING OR OTHER UNKNOWN ERROR: SO DONT LEAK IT, BE CAREFUL
    console.error(chalk.blue('Production Unknown Error'));
    console.error(chalk.red('ERROR 💥 ') + ' | ' + chalk.cyan(err.message));
    return res.status(err.statusCode).render('error', {
        title: 'Something went wrong!',
        message: 'Please try again later.'
    });
};

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'ERROR';

    if (NODE_ENV === 'development') {
        let error = {...err};
        error.message = err.message;

        if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
        sendErrorDev(error, req, res);
    } else if (NODE_ENV === 'production') {
        let error = {...err};
        error.message = err.message;

        if (error.name === 'CastError') error = handleCastErrorDB(error);
        if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
        sendErrorProd(error, req, res);
    }
};
