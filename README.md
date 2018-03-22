# samplate
Basic but powerful frontend boilerplate.

## Tell me more!
This boilerplate can be configured with gulp.config.js file.

You can see the process of tasks whether completed or not while working via native os notifications! // OSX is better of course :)

It has an http server and file includer! You don't have to use php or something else to include an html i.e. header.html

### What can you do with this boilerplate?

* Compile and auto prefix sass files (**it has some helper classes like margins, paddings etc.**)
* Create javascript bundles transpiled via babel.
* Lint javascript files if you set lint option to true inside of gulp.config.js file.
* Direct copy or optimize and copy images.
* Copy folders or files.
* Include html files inside of html files (**You don't have to use php or something else**).
* Export files for production.
* Create a zip file of project (**without dist and node_modules folder**)
* Set specific setting for export to production or watch mode to improve working performance white in watch mode.

### How to use

First install the dependencies via npm. Write to terminal:
`npm install`

If it isn't work, you have to install [nodejs](https://nodejs.org/en/) probably :)

Basically, just set the gulp.config.js file as you want then write to terminal `gulp watch`.

To export for production, just write `gulp export`

### Configurations

You can set up the boilerplate with  _gulp.config.js_ file.

Key  | Description
-------- | -----------
paths | Type: `Boolean` Default: `true` <br> Set files' paths
paths.SCRIPTS_SRC | Type: `Boolean` Default: `true` <br> Script files' paths
paths.STYLES_SRC | Type: `Boolean` Default: `true` <br> Sass files' paths
paths.IMAGES_SRC | Type: `Boolean` Default: `true` <br> Image files' paths
paths.HTMLS_SRC | Type: `Boolean` Default: `true` <br> Main html files' paths (Without partials like header.html etc)
paths.HTMLS_ALL_SRC | Type: `Boolean` Default: `true` <br> Gives all html files' paths to gulp for watch task
paths.DIST_PATH | Type: `Boolean` Default: `true` <br> Files processed and exported into this folder
paths.SCRIPTS_DIST | Type: `Boolean` Default: `true` <br> Script files processed and exported into this folder
paths.STYLES_DIST | Type: `Boolean` Default: `true` <br> Sass files processed and exported into this folder
paths.IMAGES_DIST | Type: `Boolean` Default: `true` <br> Image files processed and exported into this folder
paths.HTMLS_DIST | Type: `Boolean` Default: `true` <br> Html files processed and exported into this folder
fileIncludeActive  | Type: `Boolean` Default: `true` <br> Html file include enabled or disabled
showNotifications  | Type: `Boolean` Default: `true` <br> Show native notifications for all tasks
copytoDistPaths  | Type: `Boolean` Default: `true` <br> Files or folders that should directly copy to dist folder
bundles  | Type: `Object` Default: `true` <br> Setting object for javascript bundles
bundles."bundle name".babel  | Type: `Boolean` Default: `true` <br> Transpile files with babel or not
bundles."bundle name".lint  | Type: `Boolean` Default: `true` <br> Lint files via eslint or not
bundles."bundle name".files  | Type: `Boolean` Default: `true` <br> Files/Folders list
watch / export  | Type: `Object` Default: `true` <br> Watch or Export settings object
watch / export .serve | Type: `Boolean` Default: `true` <br> Http server enabled or disabled
watch / export .uglifyScripts | Type: `Boolean` Default: `true` <br> Uglify JS files enabled or disabled
watch / export .minifyCss | Type: `Boolean` Default: `true` <br> Minify Sass files enabled or disabled
watch / export .optimizeImages | Type: `Boolean` Default: `true` <br> Optimize images enabled or disabled
watch / export .refreshPageAfter | Type: `Object` Default: `true` <br> Refresh page after change setting object
watch / export .refreshPageAfter.fileInclude | Type: `Boolean` Default: `true` <br> Refresh page after Html change
watch / export .refreshPageAfter.style | Type: `Boolean` Default: `true` <br> Refresh page after Sass change
watch / export .refreshPageAfter.script | Type: `Boolean` Default: `true` <br> Refresh page after Js change
watch / export .refreshPageAfter.image | Type: `Boolean` Default: `true` <br> Refresh page after Image change


### Commands

Command  | Description
-------- | -----------
styles:scss | asd
scripts:bundle | asd
eslint | asd
optimizeImages | asd
fileinclude | asd
copy:images | asd
copy:givenpaths | asd
imagesHandler | asd
exportzip | asd
clean | asd
default | asd
export | asd
serve | asd
watch | asd