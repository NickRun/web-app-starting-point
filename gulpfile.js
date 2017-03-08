const gulp = require('gulp');
const gulpLoadPlugins = require('gulp-load-plugins');
const del = require('del');
const runSequence = require('run-sequence');
const browserSync = require('browser-sync').create();
const map = require('map-stream');

const $ = gulpLoadPlugins();
const reload = browserSync.reload;

gulp.task('clean:html', del.bind(null, ['dist/**', '!dist', '!dist/js/**', '!dist/css/**']));
gulp.task('clean:css', del.bind(null, ['dist/css']));
gulp.task('clean:js', del.bind(null, ['dist/js']));

gulp.task('styles', ['clean:css'], () => {
  return gulp.src('src/styles/main.scss')
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe($.sass.sync({
      outputStyle: 'expanded',
      precision: 10,
      includePaths: ['.']
    }).on('error', $.sass.logError))
    .pipe($.autoprefixer({browsers: ['> 1%', 'last 2 versions', 'Firefox ESR']}))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest('dist/css'))
});

function handleError (error) {
  console.log(error.toString());
  this.emit('end');
}

gulp.task('lint', () => {
  return gulp.src('src/scripts/**').pipe($.eslint())
    .pipe($.eslint.format())
    .on('error', handleError)
});

gulp.task('scripts', ['clean:js', 'lint'], () => {
  return gulp.src('src/scripts/main.js')
    .pipe($.sourcemaps.init())
    .pipe($.babel({
      presets: ['es2015']
    }))
    .on('error', handleError)
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest('dist/js'));
});

gulp.task('views', ['clean:html'], () => {
  return gulp.src('src/views/*.pug')
  .pipe($.pug({
    pretty: true
  }))
  .pipe(gulp.dest('dist'));
});

gulp.task('default', () => {
  runSequence(['styles', 'lint', 'scripts', 'views'], ()=> {
    browserSync.init({
      notify: false,
      port: 9000,
      server: {
        baseDir: ['dist']
      }
    });

    gulp.watch([
      'dist/**/*'
    ]).on('change', reload);

    gulp.watch('src/views/**/*.pug', ['views']);
    gulp.watch('src/styles/**/*.scss', ['styles']);
    gulp.watch('src/scripts/**/*.js', ['scripts']);
  });
})
