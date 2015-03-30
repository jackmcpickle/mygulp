var gulp          = require('gulp');
var coffee        = require('gulp-coffee');
var concat        = require('gulp-concat');
var minifyCSS     = require('gulp-minify-css');
var uglifyJS      = require('gulp-uglify');
var imagemin      = require('gulp-imagemin');
var sourcemaps    = require('gulp-sourcemaps');
var del           = require('del');
var sprite        = require('gulp-sprite-generator');
var livereload    = require('gulp-livereload');
var sass          = require('gulp-ruby-sass');
var haml          = require('gulp-ruby-haml');
var autoprefixer  = require('gulp-autoprefixer');
var runSequence   = require('run-sequence');


var paths = {
  scripts: ['./public_html/assets/coffee/**/*.coffee'],
  images: './public_html/assets/img/**/*',
  scss: './public_html/assets/scss/app.scss',
  haml: ['./_templates/**/*.haml'],
  build: './public_html/dist',
  build_js: './public_html/dist/js',
  build_css: './public_html/dist/css',
  build_img: './public_html/dist/img'
};

// https://www.npmjs.com/package/gulp-sprite-generator
gulp.task('sprites', function() {
    var spriteOutput;

    spriteOutput = gulp.src(paths.scss)
        .pipe(sprite({
            baseUrl:         paths.images,
            spriteSheetName: "sprite.png",
            spriteSheetPath: paths.build_img
        }));

    spriteOutput.css.pipe(gulp.dest(paths.build_css));
    spriteOutput.img.pipe(gulp.dest(paths.build_img));
});


gulp.task('haml', function() {
  return gulp.src(paths.haml)
    .pipe(haml())
    .pipe(gulp.dest('./public_html'));
});


gulp.task('sass', function () {
  return sass(paths.scss, { sourcemap: true })
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(autoprefixer({browsers: ['> 2%']}))
    .pipe(sourcemaps.write('./.'))
    .pipe(gulp.dest(paths.build_css));
});


gulp.task('clean', function(cb) {
  // You can use multiple globbing patterns as you would with `gulp.src`
  del([paths.build], cb);
});


gulp.task('scripts', function() {
  // Minify and copy all JavaScript (except vendor scripts)
  // with sourcemaps all the way down
  return gulp.src(paths.scripts)
    .pipe(sourcemaps.init())
    .pipe(coffee())
    .pipe(sourcemaps.write('./.'))
    .pipe(gulp.dest(paths.build_js));
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

// Copy all static images
gulp.task('images', function() {
  return gulp.src(paths.images)
    // Pass in options to the task
    .pipe(imagemin({optimizationLevel: 5}))
    .pipe(gulp.dest(paths.build_img));
});

// Rerun the task when a file changes
gulp.task('watch', function() {
  livereload.listen();
  gulp.watch('./public_html/assets/scss/**/*.scss', ['sass']);
  gulp.watch(paths.scripts, ['scripts']);
  gulp.watch(paths.images, ['images']);
  gulp.watch(paths.haml, ['haml']);
});


// The default task (called when you run `gulp` from cli)
gulp.task('default', ['sass', 'scripts', 'images', 'haml', 'watch']);

gulp.task('build', function(callback) {
  runSequence('clean', ['sass', 'scripts', 'haml'], 'minify', callback);
});
