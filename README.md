# samplate
Simple but powerful frontend boilerplate.

## Tell me more!
This boilerplate can be [configured](#how-can-i-configure-it) via _gulp.config.js_ file.

You can see the process of tasks' via **native os notifications!**

This boiler plate has an **http server** and **file includer!** You don't have to use **php** or something else to include an html file inside of another html file like *header.html*

### What can I do with this boilerplate?

* Compile and auto prefix **sass** files (it has some helper classes like margins, paddings etc.)
* Create **javascript bundles** transpiled via **babel**.
* **Lint javascript** files if you set lint option to true inside of gulp.config.js file.
* Direct **copy** or **optimize then copy** images.
* Copy folders or files.
* **Include html** files inside of html files (You don't have to use php or something else).
* **Export** files for production (**minify, uglify** and **optimize** them quickly and simple!).
* Create a **zip file** of project (without dist and node_modules folders ofcourse)
* Set different settings for **export** and **watch** mode to **improve development speed** (Like don't optimizing images on **watch** mode but optimize them while **export** to production)

### How can I use it?

Firstly, download or clone the project and install the dependencies via npm. Write to terminal:
<br>`npm install`

Edit _gulp.config.js_ file as you want then write to terminal:
<br>`gulp watch`.

To export project for production, just write to terminal:
<br>`gulp export`


[Wow. Show me all the commands!](#commands)

### How can I configure it?

You can change the settings of boilerplate with  _gulp.config.js_ file.

Key  | Info |  Description
----- | ------------------  |  -------
paths | Type: `Object` |  Set files' paths
paths.SCRIPTS_SRC | Type: ` Glob` <br> Example: ` './src/*.js' ` |   Script files' paths (You can use arrays too and set sort of files with write them in sequence like **['./src/first.js', './src/second.js']**)
paths.STYLES_SRC | Type: `Glob`  |   Sass files' paths
paths.IMAGES_SRC | Type: `Glob` |   Image files' paths
paths.HTMLS_SRC | Type: `Glob`  |   Main html files' paths (Without partials like header.html etc)
paths.HTMLS_ALL_SRC | Type: `Glob`  |   Gives all html files' paths to gulp for watch task
paths.DIST_PATH | Type: `Glob`  |   Files processed and exported into this folder
paths.SCRIPTS_DIST | Type: `Glob` |   Script files processed and exported into this folder
paths.STYLES_DIST | Type: `Glob`  |   Sass files processed and exported into this folder
paths.IMAGES_DIST | Type: `Glob`  |   Image files processed and exported into this folder
paths.HTMLS_DIST | Type: `Glob`  |   Html files processed and exported into this folder
fileIncludeActive  | Type: `Boolean` <br>Default: `true`  |   Html file include enabled or disabled
showNotifications  | Type: `Boolean` <br>Default: `true`  |   Show native notifications for some tasks
copytoDistPaths  | Type: `Glob`  |   Files or folders that should directly copy to dist folder
bundles  | Type: `Object`  |   Setting object for javascript bundles
bundles."bundle name".babel  | Type: `Boolean` <br>Default: `false`  |   Transpile files with babel or not
bundles."bundle name".lint  | Type: `Boolean` <br>Default: `false`  |   Lint files via eslint or not
bundles."bundle name".files  | Type: `Glob` |  Files/Folders list
watch/export  | Type: `Object` <br>Default: `true`  |   Watch or Export settings object
watch/export.**serve** | Type: `Boolean` <br>Default: `true`  |   Http server enabled or disabled
watch/export.**uglifyScripts** | Type: `Boolean` <br>Default for watch: `true`<br> Default for export: `false`  |   Uglify JS files enabled or disabled
watch/export.**minifyCss** | Type: `Boolean` <br>Default for watch: `true`<br> Default for export: `false`   |   Minify Sass files enabled or disabled
watch/export.**optimizeImages** | Type: <br>Default for watch: `true`<br> Default for export: `false`   |   Optimize images enabled or disabled
watch/export.**refreshPageAfter** | Type: `Object` |   Refresh page after change setting object
watch/export.refreshPageAfter.**fileInclude** | Type: `Boolean` <br>Default for watch: `true`<br> Default for export: `false`   |   Refresh page after Html change
watch/export.refreshPageAfter.**style** | Type: `Boolean` <br>Default for watch: `true`<br> Default for export: `false`   |   Refresh page after Sass change
watch/export.refreshPageAfter.**script** | Type: `Boolean` <br>Default for watch: `true`<br> Default for export: `false`   |   Refresh page after Js change
watch/export.refreshPageAfter.**image** | Type: `Boolean` <br>Default for watch: `true`<br> Default for export: `false`   |   Refresh page after Image change

### Example of Settings Object

 ```javascript
 module.exports = {
   paths: {
    // Scripts paths
    SCRIPTS_SRC: ['./src/assets/js/**/*.js'],
    STYLES_SRC: ['./src/assets/sass/**/*.scss'],
    IMAGES_SRC: ['./src/assets/img/**/*.*'],

    // Html paths
    HTMLS_SRC: ['./src/*.html'], // Main html files' sources (Without partials like header.html etc)
    HTMLS_ALL_SRC: ['./src/**/*.html'], // Gives all html files' paths to gulp for watch

    // Dist paths
    DIST_PATH: './dist/',
    SCRIPTS_DIST: './dist/assets/js',
    STYLES_DIST: './dist/assets/css',
    IMAGES_DIST: './dist/assets/img',
    HTMLS_DIST: './dist/'
  },
  fileIncludeActive: true,
  showNotifications: true,
  copytoDistPaths: ['./src/copyme/**/*'],
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
```

### Commands

Write to terminal:
<br>`gulp "command name"`

Command  | Description
-------- | -----------
watch | Starts watch mode.
styles:scss | Compiles css files from sass files. Creates sourcemaps, autoprefixes, and minifies.
scripts:bundle | Bundle script files. Babel is included (without import/export using) so you can write es6 codes. They will be transpiled via Babel to es5! You can enable or disable babel for each bundle inside of _gulp.config.js_ file. It creates sourcemaps also.
eslint | Lints the scripts. You can enable or disable if for each bundle _gulp.config.js_ file.
optimizeImages | Optimize images (gif, jpeg, svg, png).
fileinclude | Compile htmls with added partials like header.html, footer.html etc.
copy:images | Copy images to dist folder.
copy:givenpaths | Copy paths to dist folder.
exportzip | Exports project as zip file.
clean | Clean dist folder.
default |  Or just write __gulp__ to the terminal. It makes same tasks of watch mode except watching files.
export | Export project for **production.**
