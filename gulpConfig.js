module.exports = {
  general: {
    fileIncludeActive: true,
    showNotifications: true,
    copytoDistPaths: ['./src/copyme/**/*'],
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

