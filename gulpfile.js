'use strict';

const gulp = require('gulp');
const gm = require('gulp-gm');
const buffer = require('vinyl-buffer');
const connect = require('gulp-connect');
const cssmin = require('gulp-clean-css');
const del = require('del');
const gulpif = require('gulp-if');
const htmlBeautify = require('gulp-html-beautify');
const imagemin = require('gulp-imagemin');
const imageSize = require('image-size');
const rename = require('gulp-rename');
const sass = require('gulp-sass');
const spritesmash = require('gulp-spritesmash');
const spritesmith = require('gulp.spritesmith');
const through = require('through2');

const PROJECT_NAME = 'clayon';
const ENTRY_PATH = 'src';
const OUTPUT_PATH = 'dist';

gulp.task('clean:output', function() {
  return del([OUTPUT_PATH]);
});

gulp.task('sprite', function() {
  return gulp
    .src(ENTRY_PATH + '/sprite/icons/*.png')
    .pipe(
      spritesmith({
        imgName: 'sprite.png',
        cssName: 'sprite.scss',
        padding: 10,
      })
    )
    .pipe(buffer())
    .pipe(spritesmash())
    .pipe(gulpif('*.png', gulp.dest(ENTRY_PATH + '/img/sprite/')))
    .pipe(gulpif('*.scss', gulp.dest(ENTRY_PATH + '/sprite/scss/')));
});

gulp.task('scss-css', function() {
  return gulp
    .src(ENTRY_PATH + '/scsses/index.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(rename(PROJECT_NAME + '.css'))
    .pipe(gulp.dest(ENTRY_PATH + '/html/css/'));
});

gulp.task('cssmin', function() {
  return gulp
    .src(ENTRY_PATH + '/html/css/**/*.css')
    .pipe(cssmin())

    .pipe(gulp.dest(OUTPUT_PATH + '/css/'));
});

gulp.task('clean:scss', function() {
  return del([ENTRY_PATH + '/html/scss']);
});

gulp.task('clean:css', function() {
  return del([ENTRY_PATH + '/html/css/']);
});

gulp.task('css', gulp.series(['sprite', 'scss-css', 'clean:scss']));

gulp.task('copy:img', function() {
  return gulp.src(ENTRY_PATH + '/img/**/*.*').pipe(gulp.dest(ENTRY_PATH + '/html/img/'));
});

gulp.task('copy:img-build', function() {
  return gulp.src([ENTRY_PATH + '/html/img/**/*.*']).pipe(gulp.dest(OUTPUT_PATH + '/img/'));
});

gulp.task('imagemin', function() {
  return gulp
    .src(OUTPUT_PATH + '/img/**/{*.png, *.jpg}')
    .pipe(imagemin())
    .pipe(gulp.dest(OUTPUT_PATH + '/img/'));
});

gulp.task('clean:img', function() {
  return del([ENTRY_PATH + '/html/img/']);
});

gulp.task('clean:html-sprite', function() {
  return del([ENTRY_PATH + '/html/img/sprite/']);
});

gulp.task('clean:img-sprite', function() {
  return del([ENTRY_PATH + '/img/sprite/']);
});

gulp.task('clean:sprite', gulp.series('clean:html-sprite', 'clean:img-sprite'));

gulp.task('resize', function() {
  return gulp
    .src(ENTRY_PATH + '/sprite/icons/*.png')
    .pipe(
      through.obj(function(file, enc, cb) {
        const image = imageSize(file.path);
        if (image.width % 2 !== 0 || image.height % 2 !== 0) {
          cb(null, file);
        } else {
          cb(null);
        }
      })
    )
    .pipe(
      gm(function(gmfile, done) {
        gmfile.gravity('NorthWest').size(function(err, size) {
          done(
            null,
            gmfile.extent(Math.ceil(size.width / 2) * 2, Math.ceil(size.height / 2) * 2).background('transparent')
          );
          console.log(
            'changed. width : ' +
              size.width +
              ' = ' +
              Math.ceil(size.width / 2) * 2 +
              ' , ' +
              'height : ' +
              size.height +
              ' = ' +
              Math.ceil(size.height / 2) * 2
          );
        });
      })
    )
    .pipe(gulp.dest(ENTRY_PATH + '/sprite/icons/'));
});

gulp.task('copy:html', function() {
  const options = {
    indent_size: 4,
    indent_char: ' ',
    eol: '\n',
    indent_level: 0,
    indent_with_tabs: false,
    preserve_newlines: true,
    max_preserve_newlines: 10,
    jslint_happy: false,
    space_after_anon_function: false,
    brace_style: 'collapse',
    keep_array_indentation: false,
    keep_function_indentation: false,
    space_before_conditional: true,
    break_chained_methods: false,
    eval_code: false,
    unescape_strings: false,
    wrap_line_length: 0,
    wrap_attributes: 'auto',
    wrap_attributes_indent_size: 4,
    end_with_newline: false,
  };
  return gulp
    .src(ENTRY_PATH + '/html/*.*')
    .pipe(htmlBeautify(options))
    .pipe(gulp.dest(OUTPUT_PATH));
});

gulp.task('connect', function() {
  connect.server({
    root: './' + ENTRY_PATH + '/html/',
    livereload: true,
    port: 8888,
  });
});

gulp.task('watch', function() {
  gulp.watch([ENTRY_PATH + '/scsses/*.scss'], gulp.series(['clean:sprite', 'css', 'copy:img']));
});

gulp.task('dev', gulp.series('clean:sprite', 'css', 'copy:img', gulp.parallel('connect', 'watch')));

gulp.task(
  'build',
  gulp.series(
    'clean:sprite',
    'css',
    'cssmin',
    'copy:img',
    'copy:img-build',
    'imagemin',
    'copy:html',
    'clean:css',
    'clean:img'
  )
);
