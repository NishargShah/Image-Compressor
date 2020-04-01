const gulp = require('gulp');
const autoprefixer = require('gulp-autoprefixer');
const csso = require('gulp-csso');
const rename = require("gulp-rename");
const concat = require("gulp-concat");
const sourcemaps = require("gulp-sourcemaps");
const plumber = require("gulp-plumber");
const wait = require("gulp-wait");
const del = require('del');
const sass = require("gulp-sass");
sass.compiler = require('node-sass');

const source = [
    {
        src: 'node_modules/@fortawesome/fontawesome-free/webfonts/**',
        dest: 'public/vendor/webfonts/'
    },
    {
        src: 'node_modules/bootstrap/scss/**',
        dest: 'public/vendor/scss/'
    }
];

const FileSource = [
    {
        src: [
            'node_modules/bootstrap/dist/css/bootstrap.min.css',
            'node_modules/@fortawesome/fontawesome-free/css/all.min.css'
        ],
        concat: 'plugin.css',
        dest: 'public/vendor/css/'
    },
    {
        src: [
            'node_modules/jquery/dist/jquery.min.js',
            'node_modules/bootstrap/dist/js/bootstrap.min.js'
        ],
        concat: 'plugin.js',
        dest: 'public/vendor/js/'
    }
];

gulp.task('del', async () => {
    await del('public/vendor/**');
});

// COPY ALL FILES FROM SRC TO DIST
gulp.task('copy', async () => {
    await new Promise(resolve => {
        source.map(function (file) {
            gulp.src(file.src)
                .pipe(gulp.dest(file.dest))
                .pipe(wait(1000))
                .on('end', resolve);
        });
    });
    await new Promise(resolve => {
        FileSource.map(function (file) {
            gulp.src(file.src)
                .pipe(concat(file.concat))
                .pipe(gulp.dest(file.dest))
                .on('end', resolve);
        });
    });
});

// CONVERT DIST CSS TO MIN, loadMaps: true is doing load maps of scss files
gulp.task('css', () => {
    wait(5000);
    return gulp.src('public/css/style.css')
        .pipe(wait(5000))
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(autoprefixer({
            cascade: false
        }))
        .pipe(csso())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('public/css/'))
});

// CONVERT SASS TO CSS AND MOVE TO DIST
gulp.task('sass', async () => {
    await new Promise(resolve => {
        gulp.src('public/scss/main.scss')
            .pipe(plumber())
            .pipe(rename('style.css'))
            .pipe(sourcemaps.init())
            .pipe(sass.sync({outputStyle: 'expanded'}).on('error', sass.logError))
            .pipe(autoprefixer({
                cascade: false
            }))
            .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest('public/css/'))
            .on('end', resolve);
    });
});

gulp.task('default', gulp.series(['del', 'copy', 'sass', 'css'], done => {
    done();
}));
