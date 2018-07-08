var gulp = require('gulp');
var less = require('gulp-less');
var cleanCSS = require('gulp-clean-css');
var autoprefixer = require('gulp-autoprefixer');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
// var sourcemaps = require('gulp-sourcemaps'); - Uncomment when developing

// The default Gulp.js task
gulp.task('default', ['font-awesome-fonts', 'jquery', 'minify-js', 'less', 'watch']);

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

// Copy jQuery js assets
gulp.task('jquery', function () {
    return gulp.src('node_modules/jquery/dist/jquery.min.js')
        .pipe(gulp.dest('js'));
});

// Minify custom JS assets
gulp.task('minify-js', function () {
    return gulp.src(['js/plot.js', 'js/status.js'])
        .pipe(uglify().on('error', function(e){console.log(e)}))
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('js'));
})

// Copy Bootstrap font files in assets/fonts
gulp.task('font-awesome-fonts', function () {
    return gulp.src('node_modules/font-awesome/fonts/*')
        .pipe(gulp.dest('fonts'));
});

// Watch for LESS and JS file changes
gulp.task('watch', function () {
    gulp.watch(['less/**/*.less'], ['less']);
    gulp.watch(['js/**/*.js'], ['minify-js']);
});
