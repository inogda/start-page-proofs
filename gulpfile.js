let gulp = require('gulp'),
    sass = require('gulp-sass')(require('sass')),
    browserSync = require('browser-sync').create(),
    gulpIf = require('gulp-if'),
    jsImport = require('gulp-js-import'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    imagemin = require('gulp-imagemin'),
    autoprefixer = require('gulp-autoprefixer'),            // проставляет префиксы
    cssbeautify = require ("gulp-cssbeautify"),             // делает красивый CSS код
    removeComments = require ('gulp-strip-css-comments'),   // удаляет комментарии
    rename = require('gulp-rename'),
    clean = require('gulp-clean');                          // очищает директорию
    cssnano = require ('gulp-cssnano'),                     // сжимает CSS файл
    cssmin = require('gulp-cssmin');
let    isProd = process.env.NODE_ENV === 'prod';

//    del = require('del');

function html() {
    return gulp.src('app/*.html')
        .pipe(gulp.dest('dist'));
}

function css() {
  return gulp.src([
      'app/scss/**/*.scss'
  ])
      .pipe(sass({outputStyle: 'expanded'}))
      //.pipe(autoprefixer({ browsers: ['last 8 versions'], cascade: true }))
      .pipe(autoprefixer({
          overrideBrowserslist:  ['last 8 versions'],
          cascade: true
      }))
      .pipe(cssbeautify())
      .pipe(gulp.dest('app/css'))
      //.pipe(gulp.dest('dist/css/'))
      .pipe(removeComments())
      .pipe(cssnano({ zindex: false, discardComments: { removeAll: true } }))
      .pipe(rename({suffix: '.min'}))
      .pipe(gulp.dest('app/css'))
      .pipe(gulp.dest('dist/css/'))
      //.pipe(browserSyncReload)
      .pipe(concat('_libs.css'))
      .pipe(cssmin())
      .pipe(gulp.dest('dist/css'))
}

function allcss() {


}

function js() {
    return gulp.src('app/js/**/*.js')
        .pipe(jsImport({
            hideConsole: true
        }))
        .pipe(concat('all.js'))
        .pipe(gulpIf(isProd, uglify()))
        .pipe(gulp.dest('dist/js'))
}

function img() {
    return gulp.src('app/img/**/*')
        .pipe(gulpIf(isProd, imagemin() ))
        .pipe(gulp.dest('dist/img/'))
}

// Static server
function browsersync() {
    browserSync.init({
        port: 4000,
        browser: 'firefox',
        open: true,
        server: 'app/'
    });
}

function browserSyncReload(done) {
    browserSync.reload();
    done();
}

function watchFiles() {
    gulp.watch('app/**/*.html', gulp.series(html, browserSyncReload));
    gulp.watch('app/scss/**/*.scss', gulp.series(css, browserSyncReload));
    gulp.watch('app/js/**/*.js', gulp.series(js, browserSyncReload));
    gulp.watch('src/img/**/*.*', gulp.series(img));
    return;
}


function del() {
    return gulp.src('dist', {read: false})
        .pipe(clean());
}



exports.css = css;
exports.html = html;
exports.js = js;
exports.del = del;
exports.browsersync = gulp.parallel(html, css, js, img, watchFiles, browsersync);
exports.default = gulp.series(del, html, css, js, img);
