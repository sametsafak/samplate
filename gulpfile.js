var gulp = require('gulp');
var userSettings = require('./gulpConfig.js');
// Style packages
var sass = require('gulp-sass'),
  autoprefixer = require('gulp-autoprefixer'),
  cleanCSS = require('gulp-clean-css');

// Script packages
var babel = require('gulp-babel'),
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
  uglify = require('gulp-uglify'),
  notifier = require('node-notifier');

// let merge = require('merge-stream');


var defaultSettings = {
  fileInclude: true,
  showNotifications: true,
  copytoDistPaths: [],
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

var settings = Object.assign(defaultSettings, userSettings);
var path = settings.paths;
var currentMode = 'watch'; // 'watch' or 'export'
var errorAtFirstStart = false; // this variable is using for to decide watch and export tasks notification will show warning or successful


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
  } else {
    console.log(message);
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

// webpack test
gulp.task('webpack', () => {
  return gulp.src('./src/assets/js/entry.js')
    .pipe(webpack())
    .pipe(gulp.dest('dist/'));
});


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
    .pipe(sass().on('error', sass.logError))
    .pipe(gulpif(settings[currentMode].minifyCss, cleanCSS()))
    .pipe(autoprefixer())
    .pipe(sourcemaps.write())
    .pipe(gulpif(settings[currentMode].refreshPageAfter.style, connect.reload()))
    .pipe(gulp.dest(path.STYLES_DIST));

  stream.on('end', function () {
    streamEndHandler(self, 'styles:sass task completed!', done);
  });
});


// bundle test
gulp.task('scripts:bundle', function (done) {

  let self = this;
  let bundles = Object.keys(settings.bundles);
  let stream;

  self.errorHappened = false;

  // let tasks = bundles.map(function (bundle) { // loops every bundle key inside of bundles object
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
    // done();
    streamEndHandler(self, 'script:bundle task completed!', done);
  });

  // process all remaining files in scriptsPath root into main.js and main.min.js files
  /* var root = gulp.src(path.SCRIPTS_SRC)
    .pipe(concat('main.js'))
    .pipe(gulp.dest(path.SCRIPTS_DIST))
    .pipe(uglify())
    .pipe(rename('main.min.js'))
    .pipe(gulp.dest(path.SCRIPTS_DIST));

  return merge(tasks, root);*/
});


// bundle library script files in js/libs folder
/* gulp.task('script:libs', (done) => {

  const sources = [...settings.libScriptLoadFirst, ...LIB_path.SCRIPTS_SRC];
  let self = this;

  self.errorHappened = false;

  var stream = gulp.src(sources)
    .pipe(plumber(function (err) {
      onError(err, this, self);
    }))
    .pipe(sourcemaps.init())
    .pipe(gulpif(settings[currentMode].uglifyScripts, uglify()))
    .pipe(concat('libs.min.js'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulpif(settings[currentMode].refreshPageAfter.script, connect.reload()))
    .pipe(gulp.dest(path.SCRIPTS_DIST));

  stream.on('end', function () {
    streamEndHandler(self, 'script:libs task completed!', done);
  });
});

gulp.task('script:app', (done) => {
  const sources = [...settings.appScriptLoadFirst, ...APP_path.SCRIPTS_SRC];
  let self = this;

  self.errorHappened = false;

  var stream = gulp.src(sources)
    .pipe(plumber(function (err) {
      onError(err, this, self);
    }))
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(gulpif(settings[currentMode].uglifyScripts, uglify()))
    .pipe(concat('app.min.js'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulpif(settings[currentMode].refreshPageAfter.script, connect.reload()))
    .pipe(gulp.dest(path.SCRIPTS_DIST));

  stream.on('end', function () {
    streamEndHandler(self, 'script:app task completed!', done);
  });
});*/

/* gulp.task('eslint', function (done) {

  let self = this;

  self.errorHappened = false;

  // ESLint ignores files with "node_modules" paths.
  // So, it's best to have gulp ignore the directory as well.
  // Also, Be sure to return the stream from the task;
  // Otherwise, the task may end before the stream has finished.
  let stream = gulp.src(path.SCRIPTS_SRC)
    // eslint() attaches the lint output to the "eslint" property
    // of the file object so it can be used by other modules.
    .pipe(eslint())
    .pipe(plumber(function (err) {
      console.log('555555555555555555 erör');
      onError(err, this, self);
    }))
    // eslint.format() outputs the lint results to the console.
    // Alternatively use eslint.formatEach() (see Docs).
    .pipe(eslint.format())
    // To have the process exit with an error code (1) on
    // lint error, return the stream and pipe to failAfterError last.
    .pipe(eslint.failAfterError());

  stream.on('error', function () {
    console.log('444444444444444444444 erör');
    // streamEndHandler(self, 'eslint task completed!', done);
  });
  stream.on('end', function () {
    console.log('7444444444444444444 end');
    streamEndHandler(self, 'eslint task completed!', done);
  });
  stream.on('unpipe', function () {
    console.log('7444444444444444444 unpipe');
    done();
    // streamEndHandler(self, 'eslint task completed!', done);
  });

  // return stream;
});*/

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
    .pipe(gulp.dest(path.IMAGES_DIST));

  stream.on('end', function () {
    streamEndHandler(self, 'optimizeImages task completed!', done);
  });

});

// File include for html files
gulp.task('fileinclude:html', function () {

  let stream = gulp
    // .src("./src/html/[^_]*.html")
    .src(path.HTMLS_SRC);

  if (settings.fileIncludeActive) {
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
      .pipe(gulp.dest(path.HTMLS_DIST));
  }
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
    .src(settings.copytoDistPaths, { base: './src/' })
    .pipe(plumber(function (err) {
      onError(err);
    }))
    // .pipe(gulpif(settings[currentMode].refreshPageAfter.image, connect.reload()))
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

  let stream = gulp.src(['./**/*', '!./{node_modules,node_modules/**,dist,dist/**}'])
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
  return gulp.src(path.DIST_PATH,
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
