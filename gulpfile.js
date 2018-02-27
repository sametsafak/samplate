var gulp = require("gulp");

// Style packages
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
let cleanCSS = require('gulp-clean-css');

// Script packages
var babel = require("gulp-babel");
var uglify = require('gulp-uglify');

// Image compression packages
var imagemin = require("gulp-imagemin");
var imageminPngquant = require("imagemin-pngquant");
var imageminJpegRecompress = require('imagemin-jpeg-recompress');

// Common packages
var concat = require("gulp-concat");
var plumber = require('gulp-plumber');
var livereload = require('gulp-livereload');
var sourcemaps = require("gulp-sourcemaps");
var zip = require('gulp-zip');
var clean = require('gulp-clean');
var gulpSequence = require('gulp-sequence');
var fileinclude = require('gulp-file-include');



// Asset paths
var SCRIPTS_SRC = './src/assets/js/**/*.js';
var STYLES_SRC = './src/assets/sass/app.scss';
var IMAGES_SRC = './src/assets/img/**/*.{png,jpeg,jpg,svg,gif}';

//Html paths
var HTMLS_ALL_SRC = './src/**/*.html'; // Gives all htmls for gulp watch
var HTMLS_SRC = './src/*.html'; // Gives main htmls (without partials)

// Dist paths
var DIST_PATH = './dist/';
var SCRIPTS_DIST = DIST_PATH + 'assets/js';
var STYLES_DIST = DIST_PATH + 'assets/css';
var IMAGES_DIST = DIST_PATH + 'assets/img';
var HTMLS_DIST = DIST_PATH;


// Styles For SCSS
gulp.task('styles:scss', () => {
  return gulp.src(STYLES_SRC)
    .pipe(plumber(function (err) {
      console.log('Styles Task Error');
      console.log(err);
      this.emit('end');
    }))
    .pipe(sourcemaps.init())
    .pipe(autoprefixer())
    .pipe(sass({
      outputStyle: 'compressed'
    }))
    .pipe(sass().on('error', sass.logError))
    .pipe(cleanCSS())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(STYLES_DIST))
  // .pipe(livereload());
});

// Scripts
gulp.task("scripts", (a) => {
  return gulp.src(SCRIPTS_SRC)
    .pipe(plumber(function (err) {
      console.log('Scripts Task Error');
      console.log(err);
      this.emit('end');
    }))
    .pipe(sourcemaps.init())
    .pipe(babel())
    // .pipe(uglify())
    .pipe(concat("all.js"))
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest(SCRIPTS_DIST))
    .pipe(livereload());
});

// Image optimization
gulp.task("images:optimize", () => {
  return gulp.src(IMAGES_SRC)
    .pipe(imagemin([
      imagemin.gifsicle({ interlaced: true }),
      imagemin.jpegtran({ progressive: true }),
      imagemin.optipng({ optimizationLevel: 5 }),
      imagemin.svgo({
        plugins: [
          { removeViewBox: true },
          { cleanupIDs: false }
        ]
      }),
      imageminPngquant(),
      imageminJpegRecompress()
    ]))
    .pipe(gulp.dest(IMAGES_DIST));
});

// File include for html files
gulp.task('fileinclude:html', function() {
  return gulp
    // .src("./src/html/[^_]*.html")
    .src(HTMLS_SRC)
    .pipe(fileinclude({
        prefix: '@@',
        suffix: '',
        basepath: '@file',
        indent: true
    }))
    .pipe(gulp.dest(HTMLS_DIST));
});

// Copy
gulp.task('copy:images', () => {
  gulp
    .src(IMAGES_SRC)
    .pipe(gulp.dest(IMAGES_DIST))
});

// Export site as zip
gulp.task('export', () => {
  return gulp.src(['./**/*', '!./{node_modules,node_modules/**,dist,dist/**}'])
    .pipe(zip('website.zip'))
    .pipe(gulp.dest('./'));
});

// Delete dist folder
gulp.task('clean', () => {
  return gulp.src(DIST_PATH, {read: false})
      .pipe(clean());
});

// Default tasks
gulp.task('default', function (cb) {
  gulpSequence('clean', ['fileinclude:html', 'styles:scss', 'scripts', 'copy:images'], cb) // after clean task finished, calls other tasks
});

// Prod export tasks
gulp.task('prod', ['images:optimize', 'styles:scss', 'scripts'], () => {
  console.log('Starting default task');
});

// Watch tasks
gulp.task('watch', ['default'], function(){
  gulp.watch(SCRIPTS_SRC, ['scripts']);
  gulp.watch(STYLES_SRC, ['styles:scss']);
  gulp.watch(IMAGES_SRC, ['copy:images']);
  gulp.watch(HTMLS_ALL_SRC, ['fileinclude:html']);
});

