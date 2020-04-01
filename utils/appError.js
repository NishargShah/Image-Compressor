class AppError extends Error {
    constructor(message, statusCode) {
        super();
        this.message = message;
        this.statusCode = statusCode || 500;
        this.status = `${statusCode}`.startsWith('4') ? 'Fail' : 'ERROR';
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

const catchAsync = fn => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};


module.exports = {
    AppError, catchAsync
};
