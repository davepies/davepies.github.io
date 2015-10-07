/* jshint esnext:true */

const browserSync = require('browser-sync'),
    gulp = require('gulp'),
    jade = require('gulp-jade'),
    postcss = require('gulp-postcss'),

    paths = {
        styles: 'styles/main.css',
        templates: 'templates/*.jade'
    },
    out = 'build/';

// register tasks
gulp.task(styles);
gulp.task(templates);

gulp.task('build', gulp.parallel(templates, styles));
gulp.task('serve', gulp.series('build', watch));

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
    return gulp.src(paths.styles)
               .pipe(postcss([
                   require('postcss-import'),
                   require('cssnext')(),
                   require('postcss-nested'),
                   require('csstyle'),
                   require('postcss-extend'),
                   require('postcss-color-function'),
                //    require('cssnano')({
                //        discardComments: { removeAll: true }
                //    })
               ]))
               .pipe(gulp.dest(out))
               .pipe(browserSync.stream());
}
