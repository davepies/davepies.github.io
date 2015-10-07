/* jshint esnext:true */

const browserSync = require('browser-sync'),
    gulp = require('gulp'),
    jade = require('gulp-jade'),
    minimist = require('minimist'),
    postcss = require('gulp-postcss'),

    paths = {
        styles: 'styles/main.css',
        templates: 'templates/*.jade'
    },
    out = 'build/',

    knownOptions = {
        string: 'env',
        default: { env: process.env.NODE_ENV || 'production'}
    },
    options = minimist(process.argv.slice(2), knownOptions),

    isProdBuild = options.env === 'production';


// register tasks
gulp.task(styles);
gulp.task(templates);

gulp.task('build', gulp.parallel(templates, styles));
gulp.task('serve', gulp.series('build', watch));
gulp.task('default', gulp.series('build'));


// tasks
function watch() {
    browserSync.init({ server: './build' });

    gulp.watch(paths.styles, styles);
    gulp.watch(paths.templates, templates)
        .on('change', function () {
            setTimeout(browserSync.reload, 0.5e3);
        });
}

function templates() {
    return gulp.src(paths.templates)
               .pipe(jade({
                   pretty: true
               }))
               .pipe(gulp.dest(out));
}

function styles() {
    const commonPlugins = [
            require('postcss-import'),
            require('cssnext')(),
            require('postcss-nested'),
            require('csstyle'),
            require('postcss-extend'),
            require('postcss-color-function')
        ],
        prodPlugins = [
            require('cssnano')({
                discardComments: { removeAll: true }
            })
        ];

    var pluginsToRun = commonPlugins;

    if (isProdBuild) {
        pluginsToRun = commonPlugins.concat(prodPlugins);
    }

    return gulp.src(paths.styles)
               .pipe(postcss(pluginsToRun))
               .pipe(gulp.dest(out))
               .pipe(browserSync.stream());
}
