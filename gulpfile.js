"use strict";

import gulp from 'gulp';
import gulpSass from 'gulp-sass';
import sass from 'sass';
import plumber from 'gulp-plumber';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import minify from 'gulp-csso';
import uglify from 'gulp-uglify';
import rename from 'gulp-rename';
import imagemin from 'imagemin';
import imageminMozjpeg from 'imagemin-mozjpeg';
import imageminOptipng from 'imagemin-optipng';
import imageminSvgo from 'imagemin-svgo';
import svgstore from 'gulp-svgstore';
import posthtml from 'gulp-posthtml';
import include from 'posthtml-include';
import { deleteAsync } from 'del';
import browserSync from 'browser-sync';

const sassCompiler = gulpSass(sass);
const server = browserSync.create();
const build = 'docs';

export function style() {
  return gulp.src("sass/style.scss")
    .pipe(plumber())
    .pipe(sassCompiler())
    .pipe(postcss([autoprefixer()]))
    .pipe(gulp.dest(build + "/css"))
    .pipe(minify())
    .pipe(rename("style.min.css"))
    .pipe(gulp.dest(build + "/css"))
    .pipe(server.stream());
}

export function js() {
  return gulp.src("js/**/*.js")
    .pipe(uglify())
    .pipe(gulp.dest(build + "/js"));
}

export async function images() {
  await imagemin(["img/**/*.{png,jpg,jpeg,svg}"], {
    destination: "docs/img",
    plugins: [
      imageminMozjpeg({ quality: 75, progressive: true }),
      imageminOptipng({ optimizationLevel: 5 }),
      imageminSvgo()
    ]
  });
}

export function sprite() {
  return gulp.src("img/*-icon.svg")
    .pipe(svgstore({ inlineSvg: true }))
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest(build + "/img"));
}

export function html() {
  return gulp.src("*.html")
    .pipe(posthtml([include()]))
    .pipe(gulp.dest(build));
}

export function copy() {
  return gulp.src([
    "fonts/**/*.{woff,woff2}",
    "js/**"
  ], {
    base: "."
  })
    .pipe(gulp.dest(build));
}

export async function clean() {
  await deleteAsync([build + '/**/*.*']);
}

export function serve() {
  server.init({
    server: build + "/",
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch("sass/**/*.{scss,sass}", style);
  gulp.watch("js/**/*.js", gulp.series(js, reload));
  gulp.watch("*.html", gulp.series(html, reload));
}

function reload(done) {
  server.reload();
  done();
}

export const buildTask = gulp.series(
  clean,
  gulp.parallel(copy, images),
  style,
  js,
  sprite,
  html
);

gulp.task("style", style);
gulp.task("js", js);
gulp.task("images", images);
gulp.task("sprite", sprite);
gulp.task("html", html);
gulp.task("copy", copy);
gulp.task("clean", clean);
gulp.task("serve", serve);
gulp.task("build", buildTask);