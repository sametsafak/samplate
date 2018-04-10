module.exports = {
  fileIncludeActive: true,
  showNotifications: true,
  copytoDistPaths: ['./src/copyme/**/*'],
  paths: {
    // Scripts paths
    SCRIPTS_SRC: ['./src/assets/js/**/*.js'],
    STYLES_SRC: ['./src/assets/sass/**/*.scss'],
    IMAGES_SRC: ['./src/assets/img/**/*.*'],
    SPRITES_SRC: ['./src/assets/sprite/*.*'],

    // Html paths
    HTMLS_SRC: ['./src/*.html'], // Main html files' sources (Without partials like header.html etc)
    HTMLS_ALL_SRC: ['./src/**/*.html'], // Gives all html files' paths to gulp for watch

    // Dist paths
    DIST_PATH: './dist/',
    SCRIPTS_DIST: './dist/assets/js',
    STYLES_DIST: './dist/assets/css',
    IMAGES_DIST: './dist/assets/img',
    SPRITES_DIST: './dist/assets/sprite',
    HTMLS_DIST: './dist/',
    VERSION_DIST: './dist/',
    VERSION_FILE_NAME: 'version.txt'
  },
  bundles: {
    a: {
      babel: true,
      lint: true,
      files: ['./src/js/assets/a/a2.js', './src/assets/js/a/**/*.js']
    },
    b: {
      babel: false,
      lint: false,
      files: './src/assets/js/b/**/*.js'
    }
  },
  sprites: {
    retina: {
      files: ['./src/assets/sprite/retina/*.png'],
      retinaSrcFilter: ['./src/assets/sprite/retina/*@2x.png'],
      imgName: 'sprite-retina.png',
      retinaImgName: 'sprite-retina@2x.png',
      cssName: 'sprite-retina.css',
      cssPrefix: '.retina-icon-'
    },

    notRetina: {
      files: ['./src/assets/sprite/not-retina/*.png'],
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
};

