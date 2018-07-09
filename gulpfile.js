let gulp = require('gulp');
let userSettings = require('./gulp.config.js');
// Style packages
let sass = require('gulp-sass'),
  autoprefixer = require('gulp-autoprefixer'),
  cleanCSS = require('gulp-clean-css'),
  spritesmith = require('gulp.spritesmith');

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
  mkdirp = require('mkdirp'),
  buffer = require('vinyl-buffer'),
  merge = require('merge-stream'),
  filesExist = require('files-exist');


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
      paths: {
        // Copy given paths to dist folder with same path
        COPY_SRC: [],
        // Scripts paths
        SCRIPTS_SRC: ['./src/assets/js/**/*.js'],
        IMAGES_SRC: ['./src/assets/img/**/*.*'],
        SPRITES_SRC: ['src/assets/sprite/**/*.*'],
        SCSS_SRC: ['./src/assets/sass/**/*.scss'],
        CSS_SRC: ['./src/assets/css/**/*.css'],

        // Html paths
        HTMLS_SRC: ['./src/*.html'], // Gives main htmls (without partials)
        HTMLS_ALL_SRC: ['./src/**/*.html'], // Gives all htmls for gulp watch

        // Dist paths
        DIST_PATH: './dist/',
        SCRIPTS_DIST: './dist/assets/js',
        SCSS_DIST: './dist/assets/css',
        CSS_DIST: './dist/assets/css',
        IMAGES_DIST: './dist/assets/img',
        SPRITES_DIST: 'dist/assets/sprite',
        HTMLS_DIST: './dist/',
        VERSION_DIST: './dist/',
        VERSION_FILE_NAME: 'version.txt'
      },
      bundles: {
        app: {
          babel: false,
          lint: false,
          files: []
        }
      },
      sprites: {
        retina: {
          files: ['src/assets/sprite/retina/*.png'],
          retinaSrcFilter: ['src/assets/sprite/retina/*@2x.png'],
          imgName: 'sprite-retina.png',
          retinaImgName: 'sprite-retina@2x.png',
          cssName: 'sprite-retina.css',
          cssPrefix: '.retina-icon-'
        },
        notRetina: {
          files: ['src/assets/sprite/not-retina/*.png'],
          imgName: 'sprite-not-retina.png',
          cssName: 'sprite-not-retina.css'
          // cssPrefix: '.icon-'
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
        obj.timeout = 3;
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
        obj.timeout = 3;
        obj.sound = 'Pop';
      }

      if (APP.settings.showNotifications) {
        notifier.notify({
          title: 'Samplate',
          subtitle: obj.title,
          message: message,
          sound: obj.sound,
          timeout: obj.timeout,
          wait: false
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

// Sprite
gulp.task('sprites', function (done) {

  let self = this;
  let sprites = Object.keys(APP.settings.sprites);
  let stream;

  self.errorHappened = false;
  sprites.map(function (sprite) { // loops every sprite key inside of sprites object

    let spriteSettingObj = APP.settings.sprites[sprite];

    let obj = {
      imgName: spriteSettingObj.imgName,
      cssName: spriteSettingObj.cssName,
      cssOpts: {
        cssSelector: function (sprite) {
          return (spriteSettingObj.cssPrefix || '.icon-') + sprite.name;
        }
      }
    };

    if (spriteSettingObj.retinaSrcFilter && spriteSettingObj.retinaImgName) {
      obj.retinaSrcFilter = spriteSettingObj.retinaSrcFilter;
      obj.retinaImgName = spriteSettingObj.retinaImgName;
    }

    // Generate our spritesheet
    let spriteData = gulp.src(spriteSettingObj.files)
      .pipe(plumber(function (err) {
        APP.onError(err, this, self);
      }))
      .pipe(spritesmith(obj));

    var imgStream = spriteData.img
    // DEV: We must buffer our stream into a Buffer for `imagemin`
      .pipe(plumber(function (err) {
        APP.onError(err, this, self);
      }))
      .pipe(buffer())
      .pipe(gulpif(APP.settings[APP.currentMode].optimizeImages, imagemin([
        imagemin.gifsicle({
          interlaced: true
        }),
        imagemin.optipng({
          optimizationLevel: 5
        }),
        imageminPngquant()
      ])))
      .pipe(gulp.dest(APP.paths.SPRITES_DIST));

    // Pipe CSS stream through CSS optimizer and onto disk
    var cssStream = spriteData.css
      .pipe(plumber(function (err) {
        APP.onError(err, this, self);
      }))
      .pipe(gulpif(APP.settings[APP.currentMode].minifyCss, cleanCSS()))
      .pipe(gulp.dest(APP.paths.SPRITES_DIST));

    // Return a merged stream to handle both `end` events
    stream = merge(imgStream, cssStream);
    stream.resume();
  });

  stream.on('end', function () {
    APP.streamEndHandler(self, 'sprite task completed!', done);
  });
});

// Styles For CSS
gulp.task('styles:css', function (done) {

  let self = this;

  self.errorHappened = false;
  let stream = gulp.src(APP.paths.CSS_SRC)
    .pipe(plumber(function (err) {
      APP.onError(err, this, self);
    }))
    .pipe(sourcemaps.init())
    // .pipe(autoprefixer()) // It is commented because of this issue https://github.com/gulp-sourcemaps/gulp-sourcemaps/issues/60
    .pipe(gulpif(APP.settings[APP.currentMode].minifyCss, cleanCSS()))
    .pipe(concat('style.css',
      { newLine: '\n /* ' + '---' + ' */\n' }
    ))
    .pipe(sourcemaps.write('.'))
    .pipe(gulpif(APP.settings[APP.currentMode].refreshPageAfter.style, connect.reload()))
    .pipe(gulp.dest(APP.paths.CSS_DIST));

  stream.on('end', function () {
    APP.streamEndHandler(self, 'styles:css task completed!', done);
  });
});

// Styles For SCSS
gulp.task('styles:scss', function (done) {

  let self = this;

  self.errorHappened = false;
  let stream = gulp.src(APP.paths.SCSS_SRC)
    .pipe(plumber(function (err) {
      APP.onError(err, this, self);
    }))
    .pipe(sourcemaps.init())
    .pipe(sass())
    // .pipe(autoprefixer()) // It is commented because of this issue https://github.com/gulp-sourcemaps/gulp-sourcemaps/issues/60
    .pipe(gulpif(APP.settings[APP.currentMode].minifyCss, cleanCSS()))
    .pipe(sourcemaps.write('.'))
    .pipe(gulpif(APP.settings[APP.currentMode].refreshPageAfter.style, connect.reload()))
    .pipe(gulp.dest(APP.paths.SCSS_DIST));

  stream.on('end', function () {
    APP.streamEndHandler(self, 'styles:sass task completed!', done);
  });
});

// Bundle scripts
gulp.task('scripts:bundle', function (done) {

  let self = this;
  let bundles = Object.keys(APP.settings.bundles);
  let stream;
  let missingFilesError = true;

  self.errorHappened = false;

  this.missingFiles = [];

  bundles.map(function (bundle) { // loops every bundle key inside of bundles object

    let sources = APP.settings.bundles[bundle].files;

    filesExist(sources, {
      throwOnMissing: false,
      onMissing: function (file) {
        self.missingFilesError = true;
        self.missingFiles.push(file);
        // console.log('Warning! Script file is missing: ' + file);
      }
    });

    stream = gulp.src(sources) // value of bundle key in APP.settings object
      .pipe(plumber(function (err) {
        APP.onError(err, this, self);
      }))
      .pipe(sourcemaps.init())
      .pipe(gulpif(APP.settings.bundles[bundle].babel, babel()))
      .pipe(gulpif(APP.settings[APP.currentMode].uglifyScripts, uglify()))
      .on('error', function (err) { console.log('\x1b[36m%s\x1b[0m', err.toString()); })
      .pipe(concat(bundle + '.js'))
      .pipe(sourcemaps.mapSources(function(sourcePath, file) {
        let fullParent = file.base.replace(file.cwd, '');

        return fullParent + '/' + sourcePath;
      }))
      .pipe(sourcemaps.write('.'))
      .pipe(gulpif(APP.settings[APP.currentMode].refreshPageAfter.script, connect.reload()))
      .pipe(gulp.dest(APP.paths.SCRIPTS_DIST));
  });

  stream.on('end', function () {
    if (self.missingFilesError) {
      self.missingFilesError = false;
      APP.onError({ message: 'File(s) not found: ' + self.missingFiles }, this, self);
    } else {
      APP.streamEndHandler(self, 'script:bundle task completed!', done);
    }
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
gulp.task('fileinclude:html', function () {

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

// Copy given paths to dist folder with same path
gulp.task('copy:todist', (done) => {
  let self = this;

  self.errorHappened = false;
  let stream = gulp
    .src(APP.paths.COPY_SRC, {
      base: './src/'
    })
    .pipe(plumber(function (err) {
      APP.onError(err);
    }))
    .pipe(gulpif(APP.settings[APP.currentMode].refreshPageAfter.image, connect.reload()))
    .pipe(gulp.dest(APP.paths.DIST_PATH));

  stream.on('end', function () {
    APP.streamEndHandler(self, 'copy:todist task completed!', done);
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

// All tasks for watch or export
gulp.task('allTasks', (cb) => {

  let tasksArray = [
    'styles:css',
    'styles:scss',
    'eslint',
    'scripts:bundle',
    'imagesHandler',
    'sprites',
    'copy:todist',
    'createVersion'
  ];

  if (APP.settings.fileIncludeActive) {
    tasksArray.unshift('fileinclude:html');
  }

  gulpSequence('clean', tasksArray, cb); // after clean task finished, calls other tasks
});

// Export project for production to dist folder
gulp.task('export', (cb) => {

  APP.currentMode = 'export';

  let notificationSetting = APP.settings.showNotifications;

  APP.settings.showNotifications = false;

  gulpSequence(
    'allTasks',
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
gulp.task('serve', () => {
  connect.server({
    root: 'dist',
    livereload: true
  });
});

// Default
gulp.task('default', () => {
  let Table = require('cli-table2');
  let table = new Table();

  table.push(
    { 'watch': 'Start watch mode.' },
    { 'allTasks': 'It makes same tasks of watch mode except watching files.' },
    { 'export': 'Export project for production.' },
    { 'Single Tasks': '---' },
    { 'exportzip': 'Export project as zip file.' },
    { 'clean': 'Clean dist folder.' },
    { 'styles:scss': 'Compile css files from sass files. Create sourcemaps, autoprefixes, and minifiy them.' },
    { 'scripts:bundle': 'Bundle script files. Babel is included (without import/export using) so you can write es6 codes.' },
    { 'eslint': 'Lints the scripts. You can enable or disable if for each bundle gulp.config.js file.' },
    { 'optimizeImages': 'Optimize images (gif, jpeg, svg, png).' },
    { 'fileinclude': 'Compile htmls with added partials like header.html, footer.html etc.' },
    { 'copy:images': 'Copy images to dist folder.' },
    { 'copy:todist': 'Copy paths to dist folder with same path.' }
  );

  console.log(table.toString());
  console.log('For more information, check https://github.com/sametsafak/samplate');
  console.log('---');

});

// Watch
gulp.task('watch', () => {
  let notificationSetting = APP.settings.showNotifications;
  let watchTasks = null;

  APP.settings.showNotifications = false;
  APP.currentMode = 'watch';
  // This line written because I need to check the condition above before tasks started.

  function afterWatchStarted() {
    APP.settings.showNotifications = notificationSetting;
    if (errorAtFirstStart) {
      APP.popNotification('warning', 'Watch mode started with some errors!');
    } else {
      APP.popNotification('success', 'Watch mode started!');
    }
  }

  if (APP.settings[APP.currentMode].serve) {
    watchTasks = watchTasks || [];
    watchTasks.push('serve');
  }

  gulpSequence('allTasks', watchTasks, afterWatchStarted);

  gulp.watch(APP.paths.SCRIPTS_SRC, ['scripts:bundle', 'eslint']);
  gulp.watch(APP.paths.SCSS_SRC, ['styles:scss']);
  gulp.watch(APP.paths.CSS_SRC, ['styles:css']);
  gulp.watch(APP.paths.IMAGES_SRC, ['copy:images']);
  gulp.watch(APP.paths.HTMLS_ALL_SRC, ['fileinclude:html']);
  gulp.watch(APP.paths.SPRITES_SRC, ['sprites']);
  gulp.watch(APP.paths.COPY_SRC, ['copy:todist']);
});






