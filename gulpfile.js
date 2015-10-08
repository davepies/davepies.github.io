/* globals require, process, setTimeout */
/* jshint esnext:true */

'use strict';

const path = require('path'),
      browserSync = require('browser-sync'),
      gulp = require('gulp'),
      jade = require('gulp-jade'),
      minimist = require('minimist'),
      postcss = require('gulp-postcss'),

      paths = {
          styles: 'styles/main.css',
          templates: 'templates/index.jade',
          svg: 'assets/svg/*.svg'
      },
      watchPaths = {
          templates: 'templates/**/*.jade',
          styles: 'styles/**/*.css'
      },
      out = 'build/',

      knownOptions = {
          string: 'env',
          default: { env: process.env.NODE_ENV || 'production'}
      },
      options = minimist(process.argv.slice(2), knownOptions),

      isProdBuild = options.env === 'production';


// register tasks
gulp.task(clean);
gulp.task(styles);
gulp.task(templates);
gulp.task(svg);

gulp.task('build', gulp.series(
    clean,
    gulp.parallel(templates, styles),
    svg
));

gulp.task('serve', gulp.series('build', watch));

gulp.task('default', gulp.series('build'));


// tasks
function watch() {
    browserSync.init({ server: './build' });

    gulp.watch(watchPaths.styles, styles);
    gulp.watch(watchPaths.templates, gulp.series(templates, svg))
        .on('change', function () {
            setTimeout(browserSync.reload, 0.5e3);
        });
}

function clean() {
    return require('del')(['build']);
}

function svg() {
    let svgs = gulp.src(paths.svg)
                   .pipe(require('gulp-svgmin')(function (file) {
                       let prefix = path.basename(
                           file.relative,
                           path.extname(file.relative)
                       );
                       return {
                           plugins: [{
                               cleanupIDs: {
                                   prefix: prefix + '-',
                                   minify: true
                               }
                           }]
                       };
                   }))
                   .pipe(require('gulp-svgstore')({
                       inlineSvg: true
                   }));

    return gulp.src(out + 'index.html' )
               .pipe(require('gulp-inject')(svgs, {
                   transform: function (_, file) {
                       return file.contents.toString();
                   }
               }))
               .pipe(gulp.dest(out));
}

function templates() {
    let jadeOptions = {};

    if(isProdBuild) {
        jadeOptions.pretty = true;
    }

    return gulp.src(paths.templates)
               .pipe(jade(jadeOptions))
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

    let pluginsToRun = commonPlugins;

    if (isProdBuild) {
        pluginsToRun = commonPlugins.concat(prodPlugins);
    }

    return gulp.src(paths.styles)
               .pipe(postcss(pluginsToRun))
               .pipe(gulp.dest(out))
               .pipe(browserSync.stream());
}
