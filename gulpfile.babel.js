var gulp = require('gulp');
var uglify = require('gulp-uglify');
var pump = require('pump');
var babel = require('gulp-babel');
var concat = require('gulp-concat');

var browserSync = require('browser-sync').create();

var autoprefixer = require('gulp-autoprefixer');
var sourcemaps = require('gulp-sourcemaps');

// Uglify our JS files

gulp.task('compress', () =>
  gulp.src('js/*.js')
    .pipe(sourcemaps.init())
    .pipe(babel({
      presets: ['env']
    }))
      .pipe(concat('all.js'))
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest('dist'))
);

// Auto-Prefix our CSS
// Create SourceMaps
gulp.task('processCSS', function() {
  gulp.src('css/**/*.css')
    .pipe(sourcemaps.init())
    .pipe(autoprefixer())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('build'));
});

// Global build command
gulp.task('default', 
    ['compress', 'processCSS', 'copy-html', 'copy-images']
    
    browserSync.init({
        server: './dist'
    });
);

// Instantiate the gulp watch command so that way we don't have so much to deal 
gulp.task('watch', function() {
  gulp.watch('css/**/*.css', ['processCSS']);
  gulp.watch('js/**/*.js', ['uglify']);
  gulp.wath('/index.html', ['copy-html']);
})

gulp.task('copy-html', function() {
    gulp.src('./index.html')
        .pip(gulp.dest('./dist');
});

gulp.task('copy-images', function() {
    gulp.src('img/*')
        .pipe(gulp.dest('dist/img');
});
