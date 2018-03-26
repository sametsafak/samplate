let gulp = require('gulp');
let userSettings = require('./gulp.config.js');
// Style packages
let sass = require('gulp-sass'),
  autoprefixer = require('gulp-autoprefixer'),
  cleanCSS = require('gulp-clean-css');

// Script packages
let babel = require('gulp-babel'),
  eslint = require('gulp-eslint');

// Image compression packages
let imagemin = require('gulp-imagemin'),
  imageminPngquant = require('imagemin-pngquant'),
  imageminJpegRecompress = require('imagemin-jpeg-recompress');

// Common packages
let concat = require('gulp-concat'),
  plumber = require('gulp-plumber'),
  sourcemaps = require('gulp-sourcemaps'),
  zip = require('gulp-zip'),
  clean = require('gulp-clean'),
  gulpSequence = require('gulp-sequence'),
  fileinclude = require('gulp-file-include'),
  connect = require('gulp-connect'),
  gulpif = require('gulp-if'),
  uglify = require('gulp-uglify'),
  notifier = require('node-notifier');

// let merge = require('merge-stream');

let helpers = {
  isObject: function (item) {
    return item && typeof item === 'object' && !Array.isArray(item);
  },
  mergeDeep: function (target, ...sources) {
    if (!sources.length) {
      return target;
    }
    const source = sources.shift();

    if (helpers.isObject(target) && helpers.isObject(source)) {
      for (const key in source) {
        if (helpers.isObject(source[key])) {
          if (!target[key]) {
            Object.assign(target, {
              [key]: {}
            });
          }
          helpers.mergeDeep(target[key], source[key]);
        } else {
          Object.assign(target, {
            [key]: source[key]
          });
        }
      }
    }
    return helpers.mergeDeep(target, ...sources);
  }
};

let defaultSettings = {
  paths: {

    // Scripts paths
    SCRIPTS_SRC: ['./src/assets/js/**/*.js'],
    STYLES_SRC: ['./src/assets/sass/**/*.scss'],
    IMAGES_SRC: ['./src/assets/img/**/*.*'],

    // Html paths
    HTMLS_SRC: ['./src/*.html'], // Gives main htmls (without partials)
    HTMLS_ALL_SRC: ['./src/**/*.html'], // Gives all htmls for gulp watch

    // Dist paths
    DIST_PATH: './dist/',
    SCRIPTS_DIST: './dist/assets/js',
    STYLES_DIST: './dist/assets/css',
    IMAGES_DIST: './dist/assets/img',
    HTMLS_DIST: './dist/'
  },
  fileIncludeActive: true,
  showNotifications: true,
  copytoDistPaths: [],
  bundles: {
    a: {
      babel: false,
      lint: false,
      files: ['./src/js/assets/a/a2.js', './src/assets/js/a/**/*.js']
    },
    b: {
      babel: false,
      lint: false,
      files: './src/assets/js/b/**/*.js'
    }
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

let settings = helpers.mergeDeep(defaultSettings, userSettings);
let path = settings.paths;
let currentMode = 'watch'; // 'watch' or 'export'
let errorAtFirstStart = false; // this variable is using for to decide watch and export tasks notification will show warning or successful


let popNotification = function (type, message) {
  let obj = {};

  switch (type) {
  case 'error':
    obj.title = 'Error';
    obj.timeout = 4;
    obj.sound = 'Morse';
    break;
  case 'warning':
    obj.title = 'Warning';
    obj.timeout = 4;
    obj.sound = 'Purr';
    break;
  case 'success':
    obj.title = 'Success';
    obj.timeout = 2;
    obj.sound = 'Pop';
    break;
  default:
    obj.title = 'Samplate';
    obj.timeout = 4;
    obj.sound = 'Pop';
  }

  if (settings.showNotifications) {
    notifier.notify({
      title: 'Samplate',
      subtitle: obj.title,
      message: message,
      sound: obj.sound,
      timeout: obj.timeout
    });
  }
};

let onError = function (error, streamsThis, tasksThis) {
  errorAtFirstStart = true;
  console.log(error);
  popNotification('error', error.message);
  if (streamsThis) {
    tasksThis.errorHappened = true;
  }
  if (tasksThis) {
    streamsThis.emit('end');
  }
};

let streamEndHandler = function (self, message, cb) {
  if (!self.errorHappened) {
    popNotification('success', message);
  }
  if (cb) {
    cb();
  }
};

// Styles For SCSS
gulp.task('styles:scss', function (done) {

  let self = this;

  self.errorHappened = false;
  let stream = gulp.src(path.STYLES_SRC)
    .pipe(plumber(function (err) {
      onError(err, this, self);
    }))
    .pipe(sourcemaps.init())
    .pipe(sass())
    // .pipe(sass().on('error', sass.logError))
    .pipe(gulpif(settings[currentMode].minifyCss, cleanCSS()))
    .pipe(autoprefixer())
    .pipe(sourcemaps.write())
    .pipe(gulpif(settings[currentMode].refreshPageAfter.style, connect.reload()))
    .pipe(gulp.dest(path.STYLES_DIST));

  stream.on('end', function () {
    streamEndHandler(self, 'styles:sass task completed!', done);
  });
});

// Bundle scripts
gulp.task('scripts:bundle', function (done) {

  let self = this;
  let bundles = Object.keys(settings.bundles);
  let stream;

  self.errorHappened = false;
  bundles.map(function (bundle) { // loops every bundle key inside of bundles object

    let sources = settings.bundles[bundle].files;

    stream = gulp.src(sources) // value of bundle key in settings object
      .pipe(plumber(function (err) {
        onError(err, this, self);
      }))
      .pipe(sourcemaps.init())
      .pipe(gulpif(settings.bundles[bundle].babel, babel()))
      .pipe(gulpif(settings[currentMode].uglifyScripts, uglify()))
      .pipe(concat(bundle + '.js'))
      .pipe(sourcemaps.write('.'))
      .pipe(gulpif(settings[currentMode].refreshPageAfter.script, connect.reload()))
      .pipe(gulp.dest(path.SCRIPTS_DIST));
  });

  stream.on('end', function () {
    streamEndHandler(self, 'script:bundle task completed!', done);
  });
});

gulp.task('eslint', function () {

  let self = this;
  let bundles = Object.keys(settings.bundles);
  let stream;

  self.errorHappened = false;
  bundles.map(function (bundle) {
    let sources = settings.bundles[bundle].files;

    stream = gulp.src(sources) // value of bundle key in settings object
      .pipe(gulpif(settings.bundles[bundle].lint, eslint()))
      .pipe(plumber(function (err) {
        onError(err, this, self);
      }))
      .pipe(gulpif(settings.bundles[bundle].lint, eslint.format()))
      .pipe(gulpif(settings.bundles[bundle].lint, eslint.failAfterError()))
      .on('end', function () {
        streamEndHandler(self, 'eslint task completed!');
      });
  });

  return stream;
});

// Image optimization
gulp.task('optimizeImages', (done) => {
  console.log('Image optimization started! It will take a few minutes.');
  let self = this;

  self.errorHappened = false;
  let stream = gulp.src(path.IMAGES_SRC)
    .pipe(plumber(function (err) {
      onError(err, this, self);
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
        plugins: [{
          removeViewBox: true
        },
        {
          cleanupIDs: false
        }]
      }),
      imageminPngquant(),
      imageminJpegRecompress()
    ]))
    .pipe(gulpif(settings[currentMode].refreshPageAfter.image, connect.reload()))
    .pipe(gulp.dest(path.IMAGES_DIST));

  stream.on('end', function () {
    streamEndHandler(self, 'optimizeImages task completed!', done);
  });
});

// File include for html files
gulp.task('fileinclude:html', function () {

  let stream;


  console.log(path);

  stream = gulp
    // .src("./src/html/[^_]*.html")
    .src(path.HTMLS_SRC)
    .pipe(plumber(function (err) {
      onError(err);
    }))
    .pipe(gulpif(settings.fileIncludeActive, fileinclude({
      prefix: '@@',
      suffix: '',
      basepath: '@file',
      indent: true
    })))
    .pipe(gulpif(settings[currentMode].refreshPageAfter.fileInclude, connect.reload()))
    .pipe(gulp.dest(path.HTMLS_DIST));
  return stream;
});

// Copy images
gulp.task('copy:images', (done) => {

  let self = this;

  self.errorHappened = false;
  let stream = gulp
    .src(path.IMAGES_SRC)
    .pipe(plumber(function (err) {
      onError(err);
    }))
    .pipe(gulpif(settings[currentMode].refreshPageAfter.image, connect.reload()))
    .pipe(gulp.dest(path.IMAGES_DIST));

  stream.on('end', function () {
    streamEndHandler(self, 'copy:images task completed!', done);
  });
});

// Copy given paths
gulp.task('copy:givenpaths', (done) => {
  let self = this;

  self.errorHappened = false;
  let stream = gulp
    .src(settings.copytoDistPaths, {
      base: './src/'
    })
    .pipe(plumber(function (err) {
      onError(err);
    }))
    .pipe(gulpif(settings[currentMode].refreshPageAfter.image, connect.reload()))
    .pipe(gulp.dest(path.DIST_PATH));

  stream.on('end', function () {
    streamEndHandler(self, 'copy:givenpaths task completed!', done);
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

  let self = this;

  self.errorHappened = false;
  let stream = gulp.src(['./**/*', '!./{node_modules,node_modules/**,dist,dist/**,.history,.history/**}'])
    .pipe(plumber(function (err) {
      onError(err, this, self);
    }))
    .pipe(zip('website.zip'))
    .pipe(gulp.dest('./'));

  stream.on('end', function () {
    streamEndHandler(self, 'exportzip task completed!', done);
  });
});

// Delete dist folder
gulp.task('clean', () => {
  return gulp.src(path.DIST_PATH, {
    read: false
  })
    .pipe(plumber(function (err) {
      onError(err);
    }))
    .pipe(clean());

});

// Default tasks
gulp.task('default', (cb) => {
  gulpSequence('clean', [
    'fileinclude:html',
    'styles:scss',
    'eslint',
    'scripts:bundle',
    'imagesHandler',
    'copy:givenpaths'
  ],
  cb); // after clean task finished, calls other tasks
});

// Export project for production to dist folder
gulp.task('export', (cb) => {

  currentMode = 'export';

  let notificationSetting = settings.showNotifications;

  settings.showNotifications = false;

  gulpSequence(
    'default',
    function () {
      cb();
      settings.showNotifications = notificationSetting;
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

// Http server
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
  let notificationSetting = settings.showNotifications;

  settings.showNotifications = false;
  currentMode = 'watch';
  // This line written because I need to check the condition above before tasks started.
  gulpSequence('default', 'serve', () => {
    settings.showNotifications = notificationSetting;
    if (errorAtFirstStart) {
      popNotification('warning', 'Watch mode started with some errors!');
    } else {
      popNotification('success', 'Watch mode started!');
    }
  });

  gulp.watch(path.SCRIPTS_SRC, ['scripts:bundle', 'eslint']);
  gulp.watch(path.STYLES_SRC, ['styles:scss']);
  gulp.watch(path.IMAGES_SRC, ['copy:images']);
  gulp.watch(path.HTMLS_ALL_SRC, ['fileinclude:html']);
});
