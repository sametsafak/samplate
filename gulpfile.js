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
  notifier = require('node-notifier'),
  fs = require('fs'),
  mkdirp = require('mkdirp');


let errorAtFirstStart = false; // this variable is using for to decide watch and export tasks notification will show warning or successful


let APP = (function () {

  return {
    isObject: function (item) {
      return item && typeof item === 'object' && !Array.isArray(item);
    },
    mergeDeep: function (target, ...sources) {
      if (!sources.length) {
        return target;
      }
      const source = sources.shift();

      if (APP.isObject(target) && APP.isObject(source)) {
        for (const key in source) {
          if (APP.isObject(source[key])) {
            if (!target[key]) {
              Object.assign(target, {
                [key]: {}
              });
            }
            APP.mergeDeep(target[key], source[key]);
          } else {
            Object.assign(target, {
              [key]: source[key]
            });
          }
        }
      }
      return APP.mergeDeep(target, ...sources);
    },
    currentMode: 'watch',
    defaultSettings: {
      fileIncludeActive: true,
      showNotifications: true,
      copytoDistPaths: [],
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
    },
    settings: null,
    paths: null,
    onError: function (error, streamsThis, tasksThis) {
      errorAtFirstStart = true;
      console.log(error);
      APP.popNotification('error', error.message);
      if (streamsThis) {
        tasksThis.errorHappened = true;
      }
      if (tasksThis) {
        streamsThis.emit('end');
      }
    },
    popNotification: function (type, message) {
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

      if (APP.settings.showNotifications) {
        notifier.notify({
          title: 'Samplate',
          subtitle: obj.title,
          message: message,
          sound: obj.sound,
          timeout: obj.timeout
        });
      }
    },
    streamEndHandler: function (self, message, cb) {
      if (!self.errorHappened) {
        APP.popNotification('success', message);
      }
      if (cb) {
        cb();
      }
    },
    init: () => {
      APP.settings = APP.mergeDeep(APP.defaultSettings, userSettings);
      APP.paths = APP.settings.paths;
    }
  };
}());

APP.init();

// Styles For SCSS
gulp.task('styles:scss', function (done) {

  let self = this;

  self.errorHappened = false;
  let stream = gulp.src(APP.paths.STYLES_SRC)
    .pipe(plumber(function (err) {
      APP.onError(err, this, self);
    }))
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(gulpif(APP.settings[APP.currentMode].minifyCss, cleanCSS()))
    .pipe(autoprefixer())
    .pipe(sourcemaps.write('./'))
    .pipe(gulpif(APP.settings[APP.currentMode].refreshPageAfter.style, connect.reload()))
    .pipe(gulp.dest(APP.paths.STYLES_DIST));

  stream.on('end', function () {
    APP.streamEndHandler(self, 'styles:sass task completed!', done);
  });
});

// Bundle scripts
gulp.task('scripts:bundle', function (done) {

  let self = this;
  let bundles = Object.keys(APP.settings.bundles);
  let stream;

  self.errorHappened = false;
  bundles.map(function (bundle) { // loops every bundle key inside of bundles object

    let sources = APP.settings.bundles[bundle].files;

    stream = gulp.src(sources) // value of bundle key in APP.settings object
      .pipe(plumber(function (err) {
        APP.onError(err, this, self);
      }))
      .pipe(sourcemaps.init())
      .pipe(gulpif(APP.settings.bundles[bundle].babel, babel()))
      .pipe(gulpif(APP.settings[APP.currentMode].uglifyScripts, uglify()))
      .pipe(concat(bundle + '.js'))
      .pipe(sourcemaps.write('.'))
      .pipe(gulpif(APP.settings[APP.currentMode].refreshPageAfter.script, connect.reload()))
      .pipe(gulp.dest(APP.paths.SCRIPTS_DIST));
  });

  stream.on('end', function () {
    APP.streamEndHandler(self, 'script:bundle task completed!', done);
  });
});

// Eslint
gulp.task('eslint', function () {

  let self = this;
  let bundles = Object.keys(APP.settings.bundles);
  let stream;

  self.errorHappened = false;
  bundles.map(function (bundle) {
    let sources = APP.settings.bundles[bundle].files;

    stream = gulp.src(sources) // value of bundle key in APP.settings object
      .pipe(gulpif(APP.settings.bundles[bundle].lint, eslint()))
      .pipe(plumber(function (err) {
        APP.onError(err, this, self);
      }))
      .pipe(gulpif(APP.settings.bundles[bundle].lint, eslint.format()))
      .pipe(gulpif(APP.settings.bundles[bundle].lint, eslint.failAfterError()))
      .on('end', function () {
        APP.streamEndHandler(self, 'eslint task completed!');
      });
  });

  return stream;
});

// Image optimization
gulp.task('optimizeImages', (done) => {
  console.log('Image optimization started! Please wait.');
  let self = this;

  self.errorHappened = false;
  let stream = gulp.src(APP.paths.IMAGES_SRC)
    .pipe(plumber(function (err) {
      APP.onError(err, this, self);
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
    .pipe(gulpif(APP.settings[APP.currentMode].refreshPageAfter.image, connect.reload()))
    .pipe(gulp.dest(APP.paths.IMAGES_DIST));

  stream.on('end', function () {
    APP.streamEndHandler(self, 'optimizeImages task completed!', done);
  });
});

// File include for html files
gulp.task('fileinclude:html', function (cb) {

  if (!APP.settings.fileIncludeActive) {
    cb();
    return false;
  }

  let stream;

  stream = gulp
    // .src("./src/html/[^_]*.html")
    .src(APP.paths.HTMLS_SRC)
    .pipe(plumber(function (err) {
      APP.onError(err);
    }))
    .pipe(gulpif(APP.settings.fileIncludeActive, fileinclude({
      prefix: '@@',
      suffix: '',
      basepath: '@file',
      indent: true
    })))
    .pipe(gulpif(APP.settings[APP.currentMode].refreshPageAfter.fileInclude, connect.reload()))
    .pipe(gulp.dest(APP.paths.HTMLS_DIST));
  return stream;
});

// Copy images
gulp.task('copy:images', (done) => {

  let self = this;

  self.errorHappened = false;
  let stream = gulp
    .src(APP.paths.IMAGES_SRC)
    .pipe(plumber(function (err) {
      APP.onError(err);
    }))
    .pipe(gulpif(APP.settings[APP.currentMode].refreshPageAfter.image, connect.reload()))
    .pipe(gulp.dest(APP.paths.IMAGES_DIST));

  stream.on('end', function () {
    APP.streamEndHandler(self, 'copy:images task completed!', done);
  });
});

// Copy given paths
gulp.task('copy:givenpaths', (done) => {
  let self = this;

  self.errorHappened = false;
  let stream = gulp
    .src(APP.settings.copytoDistPaths, {
      base: './src/'
    })
    .pipe(plumber(function (err) {
      APP.onError(err);
    }))
    .pipe(gulpif(APP.settings[APP.currentMode].refreshPageAfter.image, connect.reload()))
    .pipe(gulp.dest(APP.paths.DIST_PATH));

  stream.on('end', function () {
    APP.streamEndHandler(self, 'copy:givenpaths task completed!', done);
  });
});

// Check if images should copy directly to dist or compress before copy
gulp.task('imagesHandler', (cb) => {
  if (APP.settings[APP.currentMode].optimizeImages) {
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
      APP.onError(err, this, self);
    }))
    .pipe(zip('website.zip'))
    .pipe(gulp.dest('./'));

  stream.on('end', function () {
    APP.streamEndHandler(self, 'exportzip task completed!', done);
  });
});

// Delete dist folder
gulp.task('clean', () => {

  return gulp.src(APP.paths.DIST_PATH, {
    read: false
  })
    .pipe(plumber(function (err) {
      APP.onError(err);
    }))
    .pipe(clean({ force: true }));

});

// creates a date for using as version
gulp.task('createVersion', function (cb) {
  let date = new Date();

  date = date.getTime();

  mkdirp(APP.paths.VERSION_DIST, function (err) {
    if (err) {
      console.error(err);
      cb();
    } else {
      fs.writeFile(APP.paths.VERSION_DIST + APP.paths.VERSION_FILE_NAME, date, cb);
    }
  });

  // fs.writeFile('asd/version.cshtml', d.getTime(), cb);

});

// Default tasks
gulp.task('default', (cb) => {
  gulpSequence('clean', [
    'fileinclude:html',
    'styles:scss',
    'eslint',
    'scripts:bundle',
    'imagesHandler',
    'copy:givenpaths',
    'createVersion'
  ],
  cb); // after clean task finished, calls other tasks
});

// Export project for production to dist folder
gulp.task('export', (cb) => {

  APP.currentMode = 'export';

  let notificationSetting = APP.settings.showNotifications;

  APP.settings.showNotifications = false;

  gulpSequence(
    'default',
    function () {
      cb();
      APP.settings.showNotifications = notificationSetting;
      if (!errorAtFirstStart) {
        console.log('Export completed successfully!');
        APP.popNotification('success', 'Export completed successfully!');
      } else {
        console.log('Export completed with some errors!');
        APP.popNotification('warning', 'Export completed with some errors!');
      }
    }
  );
});

// Http server
gulp.task('serve', (cb) => {
  if (APP.settings[APP.currentMode].serve) {
    connect.server({
      root: 'dist',
      livereload: true
    });
  } else {
    cb();
    return;
  }
});

// Watch
gulp.task('watch', () => {
  let notificationSetting = APP.settings.showNotifications;

  APP.settings.showNotifications = false;
  APP.currentMode = 'watch';
  // This line written because I need to check the condition above before tasks started.
  gulpSequence('default', 'serve', () => {
    APP.settings.showNotifications = notificationSetting;
    if (errorAtFirstStart) {
      APP.popNotification('warning', 'Watch mode started with some errors!');
    } else {
      APP.popNotification('success', 'Watch mode started!');
    }
  });

  gulp.watch(APP.paths.SCRIPTS_SRC, ['scripts:bundle', 'eslint']);
  gulp.watch(APP.paths.STYLES_SRC, ['styles:scss']);
  gulp.watch(APP.paths.IMAGES_SRC, ['copy:images']);
  gulp.watch(APP.paths.HTMLS_ALL_SRC, ['fileinclude:html']);
});






