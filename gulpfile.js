var gulp          = require('gulp');
var coffee        = require('gulp-coffee');
var concat        = require('gulp-concat');
var minifyCSS     = require('gulp-minify-css');
var uglifyJS      = require('gulp-uglify');
var sourcemaps    = require('gulp-sourcemaps');
var browserSync   = require('browser-sync');
var reload        = browserSync.reload;
var sass          = require('gulp-ruby-sass');
var autoprefixer  = require('gulp-autoprefixer');
var runSequence   = require('run-sequence');
var gutil         = require('gulp-util');


var paths = {
  scripts: ['./src/coffee/**/*.coffee'],
  images: './src/img/**/*',
  scss: './src/scss',
  build: './dist',
  build_js: './dist/js',
  build_css: './dist/css',
  build_img: './dist/img'
};


gulp.task('sass', function () {
  return sass(paths.scss, { sourcemap: true })
    .on('error', function (err) {
        console.error('Error!', err.message);
     })
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(autoprefixer({browsers: ['> 2%', 'last 3 versions']}))
    .pipe(sourcemaps.write('./.'))
    .pipe(gulp.dest(paths.build_css))
    .pipe(reload({stream:true}));
});

gulp.task('scripts', function() {
  // Minify and copy all JavaScript (except vendor scripts)
  // with sourcemaps all the way down
  return gulp.src(paths.scripts)
    .pipe(sourcemaps.init())
    .pipe(coffee({bare: true}).on('error', gutil.log))
    .pipe(sourcemaps.write('./.'))
    .pipe(gulp.dest(paths.build_js))
    .pipe(reload({stream:true}));
});

gulp.task('minify', function() {
   gulp.src(paths.build_css+'/*.css')
    .pipe(sourcemaps.init())
    .pipe(minifyCSS({
      keepBreaks: false,
      aggressiveMerging: false,
      roundingPrecision: -1
    }))
    .pipe(sourcemaps.write('./.'))
    .pipe(gulp.dest(paths.build_css));

  gulp.src(paths.build_js+'/*.js')
  .pipe(sourcemaps.init())
  .pipe(uglifyJS())
  .pipe(sourcemaps.write('./.'))
  .pipe(gulp.dest(paths.build_js));

});

gulp.task('browser-sync', function() {
  browserSync({
    proxy: "localhost:8000"
  });
});

// Rerun the task when a file changes
gulp.task('watch', function() {
  gulp.watch('./src/scss/**/*.scss', ['sass']);
  gulp.watch(paths.scripts, ['scripts']);
});


// The default task (called when you run `gulp` from cli)
gulp.task('default', ['sass', 'scripts', 'watch', 'browser-sync']);

gulp.task('build', function(callback) {
  runSequence(['sass', 'scripts'], 'minify', callback);
});
