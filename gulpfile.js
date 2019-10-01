'use strict';

const pkg = require('./package.json');
const del = require('del');
const gulp = require('gulp');
const gulpif = require('gulp-if');
const sass = require('gulp-sass');
const rename = require('gulp-rename');
const cssmin = require('gulp-clean-css');
const imagemin = require('gulp-imagemin');
const spritesmith = require('gulp.spritesmith');
const svgSprite = require('gulp-svg-sprite');
const connect = require('gulp-connect');

const PROJECT_NAME = pkg.name || 'project';
const ENTRY_PATH = 'src';
const OUTPUT_PATH = 'dist';

// CLEAN ------------------------------------------------------------------
gulp.task('clean:output', function() {
  return del([OUTPUT_PATH]);
});
gulp.task('clean:generated-files', function() {
  return del([ENTRY_PATH + '/img/sprite/', ENTRY_PATH + '/sprite/scss/']);
});
gulp.task('clean:dev-files', function() {
  return del([ENTRY_PATH + '/html/css/', ENTRY_PATH + '/html/img/']);
});
gulp.task('clean', gulp.series('clean:output', 'clean:generated-files', 'clean:dev-files'));

// SPRITE & SASS ------------------------------------------------------------------
gulp.task('sprite:png', function() {
  return gulp
    .src(ENTRY_PATH + '/sprite/icons/png/*.png')
    .pipe(
      spritesmith({
        imgName: 'sprite_png.png',
        cssName: 'sprite_png.scss',
        padding: 10,
      })
    )
    .pipe(gulpif('*.png', gulp.dest(ENTRY_PATH + '/img/sprite/')))
    .pipe(gulpif('*.scss', gulp.dest(ENTRY_PATH + '/sprite/scss/')));
});
gulp.task('sprite:svg', function() {
  return gulp
    .src(ENTRY_PATH + '/sprite/icons/svg/*.svg')
    .pipe(
      svgSprite({
        shape: {
          spacing: {
            padding: 10, // sprite_svg.scss 의 spacing 과 동일해야합니다.
          },
        },
        mode: {
          css: {
            dest: './',
            layout: 'diagonal',
            sprite: '/img/sprite/sprite_svg.svg',
            bust: false,
            render: {
              scss: {
                dest: '/sprite/scss/sprite_svg.scss',
                template: ENTRY_PATH + '/sprite/tpl/svg.tpl',
              },
            },
          },
        },
      })
    )
    .pipe(gulp.dest(ENTRY_PATH + '/sprite/scss/'));
});
gulp.task('sass', function() {
  return gulp
    .src(ENTRY_PATH + '/scsses/index.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(rename(PROJECT_NAME + '.css'))
    .pipe(gulp.dest(ENTRY_PATH + '/html/css/'));
});
gulp.task('css', gulp.series('sprite:png', 'sprite:svg', 'sass'));

// MINIFY ------------------------------------------------------------------
gulp.task('cssmin', function() {
  return gulp
    .src(ENTRY_PATH + '/html/css/**/*.css')
    .pipe(cssmin())
    .pipe(gulp.dest(OUTPUT_PATH + '/css/'));
});
gulp.task('imagemin', function() {
  return gulp
    .src(OUTPUT_PATH + '/img/**/{*.png, *.jpg}')
    .pipe(imagemin())
    .pipe(gulp.dest(OUTPUT_PATH + '/img/'));
});
gulp.task('minify', gulp.series('cssmin', 'imagemin'));

// COPY ------------------------------------------------------------------
gulp.task('copy:img-dev', function() {
  return gulp.src(ENTRY_PATH + '/img/**/*.*').pipe(gulp.dest(ENTRY_PATH + '/html/img/'));
});
gulp.task('copy:img-build', function() {
  return gulp.src(ENTRY_PATH + '/img/**/*.*').pipe(gulp.dest(OUTPUT_PATH + '/img/'));
});
gulp.task('copy:html', function() {
  return gulp.src(ENTRY_PATH + '/html/*.*').pipe(gulp.dest(OUTPUT_PATH));
});

// BUILD & WATCH ------------------------------------------------------------------
gulp.task('connect', function() {
  connect.server({
    root: './' + ENTRY_PATH + '/html/',
    livereload: true,
    port: 8888,
  });
});

gulp.task('watch', function() {
  gulp.watch([ENTRY_PATH + '/scsses/*.scss'], gulp.series(['css', 'copy:img-dev']));
});

gulp.task('dev', gulp.series('css', 'copy:img-dev', gulp.parallel('connect', 'watch')));

gulp.task(
  'build',
  gulp.series('clean', 'css', 'copy:img-build', 'copy:html', 'minify', 'clean:generated-files', 'clean:dev-files')
);
