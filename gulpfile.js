// @ts-check
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
var connect = require('gulp-connect');
var gulpif = require('gulp-if');


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


var defaultSettings = {
  watch: {
    serve: false,
    uglifyScripts: false,
    minifyCss: false,
    optimizeImages: false,
    refreshPageAfter: {
      fileInclude: true,
      style: true,
      script: true,
      image: true
    }
  },
  export: {
    serve: false,
    uglifyScripts: true,
    minifyCss: true,
    optimizeImages: true,
    refreshPageAfter: {
      fileInclude: false,
      style: false,
      script: false,
      image: true
    }
  }
}

var userSettings = {
  watch: {
    serve: true,
    uglifyScripts: false,
    minifyCss: false,
    optimizeImages: false,
    refreshPageAfter: {
      fileInclude: true,
      style: true,
      script: true,
      image: true
    }
  },
  export: {
    serve: true,
    uglifyScripts: true,
    minifyCss: true,
    optimizeImages: true,
    refreshPageAfter: {
      fileInclude: false,
      style: false,
      script: false,
      image: false
    }
  }
}

var settings = Object.assign(defaultSettings, userSettings);

var currentMode = 'watch'; // 'watch' or 'export'

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
    .pipe(sass())
    .pipe(sass().on('error', sass.logError))
    .pipe(gulpif(settings[currentMode].minifyCss, cleanCSS()))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(STYLES_DIST))
    .pipe(gulpif(settings[currentMode].refreshPageAfter.style, connect.reload()));
});

// Scripts
gulp.task("scripts", (a) => {
  return gulp.src(SCRIPTS_SRC)
    .pipe(plumber(function (err) {
      console.log('Scripts Task Error:', err);
      this.emit('end');
    }))
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(gulpif(settings[currentMode].uglifyScripts, uglify()))
    .pipe(concat("all.min.js"))
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest(SCRIPTS_DIST))
    .pipe(gulpif(settings[currentMode].refreshPageAfter.script, connect.reload()));
});

// Image optimization
gulp.task("optimizeImages", () => {
  console.log('Image optimization started! It will take a few minutes.');
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
    .pipe(gulp.dest(IMAGES_DIST))
    .pipe(gulpif(settings[currentMode].refreshPageAfter.image, connect.reload()));
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
    .pipe(gulp.dest(HTMLS_DIST))
    .pipe(connect.reload())
    .pipe(gulpif(settings[currentMode].refreshPageAfter.fileInclude, connect.reload()));
});

// Copy
gulp.task('copy:images', () => {
  gulp
    .src(IMAGES_SRC)
    .pipe(gulp.dest(IMAGES_DIST))
    .pipe(gulpif(settings[currentMode].refreshPageAfter.image, connect.reload()));
});

gulp.task('imagesHandler', (cb) => {
  if (settings[currentMode].optimizeImages) {
    gulpSequence('optimizeImages', cb);
  } else {
    gulpSequence('copy:images', cb);
  }
});

// Export project as zip
gulp.task('exportzip', () => {
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
gulp.task('default', (cb) => {
  gulpSequence('clean', ['fileinclude:html', 'styles:scss', 'scripts', 'imagesHandler'], cb) // after clean task finished, calls other tasks
});

// Export project for production to dist folder
gulp.task('export', (cb) => {

  currentMode = 'export';

  gulpSequence(
    'default',
    function () {
      console.log('Export has finished!');
      cb();
    }
  );
});

// Serve
gulp.task('serve', () => {
  if (settings[currentMode].serve) {
    connect.server({
      root: 'dist',
      livereload: true
    });
  }
});

// Watch
gulp.task('watch', () => {

  currentMode = 'watch';
  // This line written because I need to check the condition above before tasks started.
  gulpSequence('default', 'serve', () => { console.log('Watch mode started.') });

  gulp.watch(SCRIPTS_SRC, ['scripts']);
  gulp.watch(STYLES_SRC, ['styles:scss']);
  gulp.watch(IMAGES_SRC, ['copy:images']);
  gulp.watch(HTMLS_ALL_SRC, ['fileinclude:html']);

});

