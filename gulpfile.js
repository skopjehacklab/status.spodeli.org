var gulp = require('gulp');
var less = require('gulp-less');
var cleanCSS = require('gulp-clean-css');
var autoprefixer = require('gulp-autoprefixer');
// var sourcemaps = require('gulp-sourcemaps'); - Uncomment when developing
// var uglify = require('gulp-uglify');
// var rename = require('gulp-rename');

// The default Gulp.js task
gulp.task('default', ['bootstrap-fonts', 'bootstrap-js', 'jquery', 'jquery-flot', 'less', 'watch']);

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

// Copy Bootstrap js assets
gulp.task('bootstrap-js', function () {
    return gulp.src('node_modules/bootstrap/dist/js/bootstrap.min.js')
        .pipe(gulp.dest('js'));
});

// Copy jQuery js assets
gulp.task('jquery', function () {
    return gulp.src('node_modules/jquery/dist/jquery.min.js')
        .pipe(gulp.dest('js'));
});

// Copy jQuery Flot js assets
gulp.task('jquery-flot', function () {
    return gulp.src('node_modules/jquery.flot/jquery.flot*.js')
        .pipe(gulp.dest('js/flot'));
});

// Copy Bootstrap font files in assets/fonts
gulp.task('bootstrap-fonts', function () {
    return gulp.src('node_modules/bootstrap/dist/fonts/*')
        .pipe(gulp.dest('fonts'));
});

// Watch for LESS and JS file changes
gulp.task('watch', function () {
    gulp.watch(['less/**/*.less'], ['less']);
});