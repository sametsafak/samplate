var gulp = require('gulp');

// Style packages
var sass = require('gulp-sass'),
  autoprefixer = require('gulp-autoprefixer'),
  cleanCSS = require('gulp-clean-css');

// Script packages
var babel = require('gulp-babel'),
  uglify = require('gulp-uglify'),
  eslint = require('gulp-eslint');

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
  notifier = require('node-notifier');





// Asset paths
var LIB_SCRIPTS_SRC = ['./src/assets/js/libs/**/*.js'],
  APP_SCRIPTS_SRC = ['./src/assets/js/app/**/*.js'],
  STYLES_SRC = ['./src/assets/sass/**/*.scss'],
  IMAGES_SRC = ['./src/assets/img/**/*.{png,jpeg,jpg,svg,gif}'];

// Html paths
var HTMLS_ALL_SRC = ['./src/**/*.html'], // Gives all htmls for gulp watch
  HTMLS_SRC = ['./src/*.html']; // Gives main htmls (without partials)

// Dist paths
var DIST_PATH = './dist/',
  SCRIPTS_DIST = DIST_PATH + 'assets/js',
  STYLES_DIST = DIST_PATH + 'assets/css',
  IMAGES_DIST = DIST_PATH + 'assets/img',
  HTMLS_DIST = DIST_PATH;


var defaultSettings = {
  general: {
    fileInclude: true,
    showNotifications: true,
    appScriptLoadFirst: [
      // examples
      // './src/assets/js/app/helper.js',
      // './src/assets/js/app/methods2.js'
    ],
    libScriptLoadFirst: [
      // examples
      // './src/assets/js/libs/jquery.js'
      // './src/assets/js/libs/bootstrap.js'
    ]
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
      image: false
    }
  }
};
var userSettings = {
  general: {
    fileIncludeActive: true,
    showNotifications: true,
    appScriptLoadFirst: [
      './src/assets/js/app/helper.js',
      './src/assets/js/app/methods2.js'
    ],
    libScriptLoadFirst: [
      './src/assets/js/libs/zzz.js',
      './src/assets/js/libs/jquery.js'
    ]
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
    serve: false,
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
var errorAtFirstStart = false;


let popNotification = function (type, message) {
  let obj = {};

  switch (type) {
  case 'error':
    obj.title = 'Error';
    obj.timeout = 4;
    obj.remove = 0;
    obj.sound = 'Morse';
    break;
  case 'warning':
    obj.title = 'Warning';
    obj.timeout = 4;
    obj.remove = 1;
    obj.sound = 'Purr';
    break;
  case 'success':
    obj.title = 'Success';
    obj.timeout = 2;
    obj.remove = 1;
    obj.sound = 'Pop';
    break;
  default:
    obj.title = 'Samplate';
    obj.timeout = 4;
    obj.remove = 1;
    obj.sound = 'Pop';
  }

  if (settings.general.showNotifications) {
    notifier.notify({
      title: 'Samplate',
      subtitle: obj.title,
      message: message,
      sound: obj.sound,
      timeout: obj.timeout,
      remove: obj.remove
    });
  } else {
    console.log(message);
  }
};

let onError = function (error) {
  errorAtFirstStart = true;
  console.log(error);
  popNotification('error', error.message);
};

// Styles For SCSS
gulp.task('styles:scss', function (done) {

  let errorHappened = false;
  let stream = gulp.src(STYLES_SRC)
    .pipe(plumber(function (err) {
      onError(err);
      errorHappened = true;
    }))
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(sass().on('error', sass.logError))
    .pipe(gulpif(settings[currentMode].minifyCss, cleanCSS()))
    .pipe(autoprefixer())
    .pipe(sourcemaps.write())
    .pipe(gulpif(settings[currentMode].refreshPageAfter.style, connect.reload()))
    .pipe(gulp.dest(STYLES_DIST));

  stream.on('end', function () {
    if (!errorHappened) {
      popNotification('success', 'styles:sass task completed!');
    }
    done();
  });
});

// bundle library script files in js/libs folder
gulp.task('script:libs', (done) => {

  const sources = [...settings.general.libScriptLoadFirst, ...LIB_SCRIPTS_SRC];
  let errorHappened = false;

  var stream = gulp.src(sources)
    .pipe(plumber(function (err) {
      onError(err);
      errorHappened = true;
    }))
    .pipe(sourcemaps.init())
    .pipe(gulpif(settings[currentMode].uglifyScripts, uglify()))
    .pipe(concat('libs.min.js'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulpif(settings[currentMode].refreshPageAfter.script, connect.reload()))
    .pipe(gulp.dest(SCRIPTS_DIST));

  stream.on('end', function () {
    if (!errorHappened) {
      popNotification('success', 'script:libs task completed!');
    }
    done();
  });
});

gulp.task('script:app', (done) => {
  const sources = [...settings.general.appScriptLoadFirst, ...APP_SCRIPTS_SRC];
  let errorHappened = false;

  var stream = gulp.src(sources)
    .pipe(plumber(function (err) {
      onError(err);
      errorHappened = true;
    }))
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(gulpif(settings[currentMode].uglifyScripts, uglify()))
    .pipe(concat('app.min.js'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulpif(settings[currentMode].refreshPageAfter.script, connect.reload()))
    .pipe(gulp.dest(SCRIPTS_DIST));

  stream.on('end', function () {
    if (!errorHappened) {
      popNotification('success', 'script:app task completed!');
    }
    done();
  });
});

gulp.task('eslint', () => {
  // ESLint ignores files with "node_modules" paths.
  // So, it's best to have gulp ignore the directory as well.
  // Also, Be sure to return the stream from the task;
  // Otherwise, the task may end before the stream has finished.
  return gulp.src(APP_SCRIPTS_SRC)
    .pipe(plumber(function (err) {
      onError(err);
    }))
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

// Image optimization
gulp.task('optimizeImages', (done) => {
  console.log('Image optimization started! It will take a few minutes.');
  let errorHappened = false;

  let stream = gulp.src(IMAGES_SRC)
    .pipe(plumber(function (err) {
      onError(err);
      errorHappened = true;
    }))
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
        plugins: [
          {
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
    .pipe(gulpif(settings[currentMode].refreshPageAfter.image, connect.reload()))
    .pipe(gulp.dest(IMAGES_DIST));

  stream.on('end', function () {
    if (!errorHappened) {
      popNotification('success', 'optimizeImages task completed!');
    }
    done();
  });

});

// File include for html files
gulp.task('fileinclude:html', function () {

  let stream = gulp
    // .src("./src/html/[^_]*.html")
    .src(HTMLS_SRC);

  if (settings.general.fileIncludeActive) {
    stream.pipe(fileinclude(
      {
        prefix: '@@',
        suffix: '',
        basepath: '@file',
        indent: true
      }))
      .pipe(plumber(function (err) {
        onError(err);
      }))
      .pipe(gulpif(settings[currentMode].refreshPageAfter.fileInclude, connect.reload()))
      .pipe(gulp.dest(HTMLS_DIST));
  }
  return stream;
});

// Copy
gulp.task('copy:images', (done) => {
  let errorHappened = false;

  let stream = gulp
    .src(IMAGES_SRC)
    .pipe(plumber(function (err) {
      onError(err);
    }))
    .pipe(gulpif(settings[currentMode].refreshPageAfter.image, connect.reload()))
    .pipe(gulp.dest(IMAGES_DIST));

  stream.on('end', function () {
    if (!errorHappened) {
      popNotification('success', 'copy:images task completed!');
    }
    done();
  });
});

// Check if images should copy directly to dist or compress before copy
gulp.task('imagesHandler', (cb) => {
  if (settings[currentMode].optimizeImages) {
    gulpSequence('optimizeImages', cb);
  } else {
    gulpSequence('copy:images', cb);
  }
});

// Export project as zip
gulp.task('exportzip', (done) => {
  let errorHappened = false;

  let stream = gulp.src(['./**/*', '!./{node_modules,node_modules/**,dist,dist/**}'])
    .pipe(plumber(function (err) {
      onError(err);
      errorHappened = true;
    }))
    .pipe(zip('website.zip'))
    .pipe(gulp.dest('./'));

  stream.on('end', function () {
    if (!errorHappened) {
      popNotification('success', 'exportzip task completed!');
    }
    done();
  });
});

// Delete dist folder
gulp.task('clean', () => {
  return gulp.src(DIST_PATH,
    {
      read: false
    })
    .pipe(plumber(function (err) {
      onError(err);
    }))
    .pipe(clean());

});

// Default tasks
gulp.task('default', (cb) => {
  gulpSequence('clean',
    [
      'fileinclude:html',
      'styles:scss',
      'eslint',
      'script:libs',
      'script:app',
      'imagesHandler'
    ],
    cb); // after clean task finished, calls other tasks
});

// Export project for production to dist folder
gulp.task('export', (cb) => {

  currentMode = 'export';

  let notificationSetting = settings.general.showNotifications;

  settings.general.showNotifications = false;

  gulpSequence(
    'default',
    function () {
      cb();
      settings.general.showNotifications = notificationSetting;
      if (!errorAtFirstStart) {
        console.log('Export completed successfully!');
        popNotification('success', 'Export completed successfully!');
      } else {
        console.log('Export completed with some errors!');
        popNotification('warning', 'Export completed with some errors!');
      }
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
  let notificationSetting = settings.general.showNotifications;

  settings.general.showNotifications = false;
  currentMode = 'watch';
  // This line written because I need to check the condition above before tasks started.
  gulpSequence('default', 'serve', () => {
    settings.general.showNotifications = notificationSetting;
    if (errorAtFirstStart) {
      popNotification('warning', 'Watch mode started with some errors!');
    } else {
      popNotification('success', 'Watch mode started!');
    }
  });

  gulp.watch(LIB_SCRIPTS_SRC, ['script:libs']);
  gulp.watch(APP_SCRIPTS_SRC, ['script:app']);
  gulp.watch(STYLES_SRC, ['styles:scss']);
  gulp.watch(IMAGES_SRC, ['copy:images']);
  gulp.watch(HTMLS_ALL_SRC, ['fileinclude:html']);

});
