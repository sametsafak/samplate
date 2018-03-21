module.exports = {
  general: {
    fileIncludeActive: true,
    showNotifications: true,
    copytoDistPaths: ['./src/copyme/**/*'],
    bundles: {
      a: ['./src/js/assets/a/a2.js', './src/assets/js/a/**/*.js'],
      b: './src/assets/js/b/**/*.js'
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

