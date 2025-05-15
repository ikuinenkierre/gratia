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

gulp.task("style", async function() {
  gulp.src("sass/style.scss")
    .pipe(plumber())
    .pipe(sassCompiler())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(gulp.dest(build + "/css"))
    .pipe(minify())
    .pipe(rename("style.min.css"))
    .pipe(gulp.dest(build +"/css"))
    .pipe(server.stream());
});

gulp.task("js", function() {
  return gulp.src("js/**/*.js")
    .pipe(uglify())
    .pipe(gulp.dest(build + "/js"));
});

export async function images() {
  await imagemin(["img/**/*.{png,jpg,jpeg,svg}"], {
    destination: "docs/img",
    plugins: [
      imageminMozjpeg({ quality: 75, progressive: true }),
      imageminOptipng({ optimizationLevel: 5 }),
      imageminSvgo()
    ]
  });
};



// gulp.task("images", function () {
//   return gulp.src("img/**/*.{png,jpg,jpeg,svg}")
//     .pipe(imagemin([
//       imagemin.imageminMozjpeg({ quality: 75, progressive: true }),
//       imagemin.imageminOptipng({ optimizationLevel: 5 }),
//       imagemin.imageminSvgo()
//     ]))
//     .pipe(gulp.dest(build + "/img"));
// });

gulp.task("sprite", function () {
  return gulp.src("img/*-icon.svg")
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest(build + "/img"));
});

gulp.task("html", function () {
  return gulp.src("*.html")
    .pipe(posthtml([
      include()
    ]))
    .pipe(gulp.dest(build));
});

gulp.task("copy", function () {
  return gulp.src([
    "fonts/**/*.{woff,woff2}",
    "img/**/*.{png,jpg,jpeg,svg}",
    "js/**"
  ], {
    base: "."
  })
  .pipe(gulp.dest(build));
});

gulp.task("clean", async function () {
  await deleteAsync([build + '/**/*.*']);
});


gulp.task("serve", function() {
  server.init({
    server: build + "/",
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch("sass/**/*.{scss,sass}", ["style"])
    .on('change', server.reload);
  gulp.watch("js/**/*.js", ["js"])
    .on('change', server.reload);
  gulp.watch("*.html", ["html"])
    .on('change', server.reload);
});

gulp.task("build", 
  gulp.series("clean", "copy", "style", "js", "sprite", "html")
);