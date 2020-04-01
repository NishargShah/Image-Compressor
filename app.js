const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const xss = require('xss-clean');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');
const app = express();

// SET VIEW ENGINE TO PUG & SET PAGES AS ROOT
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// CONTROLLERS
const {AppError} = require('./utils/appError');
const {upload, resizeUserPhoto, mainController} = require('./controllers/imageController');

// GLOBAL MIDDLEWARES
app.use(cors());
app.options('*', cors());
app.use(express.static(path.join(__dirname, 'public'))); // Serving static files
app.use(helmet()); // Set security HTTP headers
process.env.NODE_ENV === 'development' ? app.use(morgan('dev')) : null; // Development logging
app.use('/api', rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: {
    message: 'Too many requests from this IP, please try again in an hour!'
  }
})); // Limit requests from same API
app.use(express.json({ limit: '10kb' })); // Body parser, reading data from body into req.body
app.use(cookieParser()); // Body parser, reading data from cookie
app.use(xss()); // Data sanitization against XSS
app.use(compression()); // COMPRESS RESPONSE BODY

// ROUTES
app.post('/api/upload', upload, resizeUserPhoto, mainController);
app.get('/', require('./controllers/viewsController').getHomepage);

// IF NO ROUTES MATCHING ABOVE THAN IT WILL DISPLAY BELOW ROUTE
app.all('*', (req, res, next) => {
  next(new AppError(`Cant find '${req.originalUrl}' on this server`, 404));
});

// IF YOU PASS ARGUMENT IN NEXT FUNCTION, IT WILL AUTOMATICALLY GOTO ERROR HANDLER BY EXPRESS
app.use(require('./controllers/errorController'));

module.exports = app;
