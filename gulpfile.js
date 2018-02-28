var gulp = require('gulp');

// Style packages
var sass = require('gulp-sass'),
  autoprefixer = require('gulp-autoprefixer'),
  cleanCSS = require('gulp-clean-css');

// Script packages
var babel = require('gulp-babel'),
  uglify = require('gulp-uglify');

// Image compression packages
var imagemin = require('gulp-imagemin'),
  imageminPngquant = require('imagemin-pngquant'),
  imageminJpegRecompress = require('imagemin-jpeg-recompress');

// Common packages
var concat = require('gulp-concat'),
  plumber = require('gulp-plumber'),
  sourcemaps = require('gulp-sourcemaps'),
  zip = require('gulp-zip'),
  clean = require('gulp-clean'),
  gulpSequence = require('gulp-sequence'),
  fileinclude = require('gulp-file-include'),
  connect = require('gulp-connect'),
  gulpif = require('gulp-if'),
  eslint = require('gulp-eslint');

var babelify = require('babelify'),
  browserify = require('browserify'),
  source = require('vinyl-source-stream'),
  buffer = require('vinyl-buffer');


// Asset paths
var SCRIPTS_SRC = './src/assets/js/**/*.js',
  STYLES_SRC = './src/assets/sass/app.scss',
  IMAGES_SRC = './src/assets/img/**/*.{png,jpeg,jpg,svg,gif}';

// Html paths
var HTMLS_ALL_SRC = './src/**/*.html', // Gives all htmls for gulp watch
  HTMLS_SRC = './src/*.html'; // Gives main htmls (without partials)

// Dist paths
var DIST_PATH = './dist/',
  SCRIPTS_DIST = DIST_PATH + 'assets/js',
  STYLES_DIST = DIST_PATH + 'assets/css',
  IMAGES_DIST = DIST_PATH + 'assets/img',
  HTMLS_DIST = DIST_PATH;


var defaultSettings = {
  general: {
    fileInclude: true
  },
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
};
var userSettings = {
  general: {
    fileIncludeActive: true
  },
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
};
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
gulp.task('scripts', () => {
  return gulp.src(SCRIPTS_SRC)
    .pipe(plumber(function (err) {
      console.log('Scripts Task Error:', err);
      this.emit('end');
    }))
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(gulpif(settings[currentMode].uglifyScripts, uglify()))
    .pipe(concat('all.min.js'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(SCRIPTS_DIST))
    .pipe(gulpif(settings[currentMode].refreshPageAfter.script, connect.reload()));
});
gulp.task('eslint', () => {
  // ESLint ignores files with "node_modules" paths.
  // So, it's best to have gulp ignore the directory as well.
  // Also, Be sure to return the stream from the task;
  // Otherwise, the task may end before the stream has finished.
  return gulp.src([SCRIPTS_SRC, '!node_modules/**'])
    // eslint() attaches the lint output to the "eslint" property
    // of the file object so it can be used by other modules.
    .pipe(eslint())
    // eslint.format() outputs the lint results to the console.
    // Alternatively use eslint.formatEach() (see Docs).
    .pipe(eslint.format())
    // To have the process exit with an error code (1) on
    // lint error, return the stream and pipe to failAfterError last.
    .pipe(eslint.failAfterError());
});

gulp.task('testt', () => {
  browserify(['./src/assets/js/app.js', './src/assets/js/asd.js'])
    .transform(babelify)
    .bundle()
    .pipe(source('ddd.js'))
    .pipe(gulp.dest(SCRIPTS_DIST))
    .pipe(buffer()); // You need this if you want to continue using the stream with other plugins
});

// Image optimization
gulp.task('optimizeImages', () => {
  console.log('Image optimization started! It will take a few minutes.');
  return gulp.src(IMAGES_SRC)
    .pipe(imagemin([
      imagemin.gifsicle({
        interlaced: true
      }),
      imagemin.jpegtran({
        progressive: true
      }),
      imagemin.optipng({
        optimizationLevel: 5
      }),
      imagemin.svgo({
        plugins: [{
            removeViewBox: true
          },
          {
            cleanupIDs: false
          }
        ]
      }),
      imageminPngquant(),
      imageminJpegRecompress()
    ]))
    .pipe(gulp.dest(IMAGES_DIST))
    .pipe(gulpif(settings[currentMode].refreshPageAfter.image, connect.reload()));
});

// File include for html files
gulp.task('fileinclude:html', function () {

  let stream = gulp
    // .src("./src/html/[^_]*.html")
    .src(HTMLS_SRC);

  if ( settings.general.fileIncludeActive ) {
    stream.pipe(fileinclude({
      prefix: '@@',
      suffix: '',
      basepath: '@file',
      indent: true
    }))
      .pipe(gulp.dest(HTMLS_DIST))
      .pipe(connect.reload())
      .pipe(gulpif(settings[currentMode].refreshPageAfter.fileInclude, connect.reload()));
  }

  return stream;
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
  return gulp.src(DIST_PATH, {
      read: false
    })
    .pipe(clean());
});

// Default tasks
gulp.task('default', (cb) => {
  gulpSequence('clean', ['fileinclude:html', 'styles:scss', 'eslint', 'scripts', 'imagesHandler'], cb); // after clean task finished, calls other tasks
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
  gulpSequence('default', 'serve', () => {
    console.log('Watch mode started.');
  });

  gulp.watch(SCRIPTS_SRC, ['scripts']);
  gulp.watch(STYLES_SRC, ['styles:scss']);
  gulp.watch(IMAGES_SRC, ['copy:images']);
  gulp.watch(HTMLS_ALL_SRC, ['fileinclude:html']);

});
