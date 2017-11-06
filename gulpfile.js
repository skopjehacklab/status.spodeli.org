var gulp = require('gulp');
var less = require('gulp-less');
var cleanCSS = require('gulp-clean-css');
var autoprefixer = require('gulp-autoprefixer');
// var sourcemaps = require('gulp-sourcemaps'); - Uncomment when developing
// var uglify = require('gulp-uglify');
// var rename = require('gulp-rename');

// The default Gulp.js task
gulp.task('default', ['less', 'watch']);

// Rebuild CSS from LESS
gulp.task('less', function () {
    return gulp.src('less/style.less')
        // .pipe(sourcemaps.init())
        .pipe(less())
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(cleanCSS({
            compatibility: 'ie8'
        }))
        // .pipe(sourcemaps.write()) - Uncomment when developing
        .pipe(gulp.dest('css'));
});

// Watch for LESS and JS file changes
gulp.task('watch', function () {
    gulp.watch(['less/**/*.less'], ['less']);
});