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

Key  | Info |  Description
-------- | -----------  |  -------
paths | Type: `Boolean` Default: `true`  |   Set files' paths
paths.SCRIPTS_SRC | Type: `Boolean` Default: `true`  |   Script files' paths
paths.STYLES_SRC | Type: `Boolean` Default: `true`  |   Sass files' paths
paths.IMAGES_SRC | Type: `Boolean` Default: `true`  |   Image files' paths
paths.HTMLS_SRC | Type: `Boolean` Default: `true`  |   Main html files' paths (Without partials like header.html etc)
paths.HTMLS_ALL_SRC | Type: `Boolean` Default: `true`  |   Gives all html files' paths to gulp for watch task
paths.DIST_PATH | Type: `Boolean` Default: `true`  |   Files processed and exported into this folder
paths.SCRIPTS_DIST | Type: `Boolean` Default: `true`  |   Script files processed and exported into this folder
paths.STYLES_DIST | Type: `Boolean` Default: `true`  |   Sass files processed and exported into this folder
paths.IMAGES_DIST | Type: `Boolean` Default: `true`  |   Image files processed and exported into this folder
paths.HTMLS_DIST | Type: `Boolean` Default: `true`  |   Html files processed and exported into this folder
fileIncludeActive  | Type: `Boolean` Default: `true`  |   Html file include enabled or disabled
showNotifications  | Type: `Boolean` Default: `true`  |   Show native notifications for all tasks
copytoDistPaths  | Type: `Boolean` Default: `true`  |   Files or folders that should directly copy to dist folder
bundles  | Type: `Object` Default: `true`  |   Setting object for javascript bundles
bundles."bundle name".babel  | Type: `Boolean` Default: `true`  |   Transpile files with babel or not
bundles."bundle name".lint  | Type: `Boolean` Default: `true`  |   Lint files via eslint or not
bundles."bundle name".files  | Type: `Boolean` Default: `true`  |   Files/Folders list
watch / export  | Type: `Object` Default: `true`  |   Watch or Export settings object
watch / export .serve | Type: `Boolean` Default: `true`  |   Http server enabled or disabled
watch / export .uglifyScripts | Type: `Boolean` Default: `true`  |   Uglify JS files enabled or disabled
watch / export .minifyCss | Type: `Boolean` Default: `true`  |   Minify Sass files enabled or disabled
watch / export .optimizeImages | Type: `Boolean` Default: `true`  |   Optimize images enabled or disabled
watch / export .refreshPageAfter | Type: `Object` Default: `true`  |   Refresh page after change setting object
watch / export .refreshPageAfter.fileInclude | Type: `Boolean` Default: `true`  |   Refresh page after Html change
watch / export .refreshPageAfter.style | Type: `Boolean` Default: `true`  |   Refresh page after Sass change
watch / export .refreshPageAfter.script | Type: `Boolean` Default: `true`  |   Refresh page after Js change
watch / export .refreshPageAfter.image | Type: `Boolean` Default: `true`  |   Refresh page after Image change


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