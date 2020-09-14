const gulp = require("gulp");
const plumber = require("gulp-plumber");
const sourcemap = require("gulp-sourcemaps");
const less = require("gulp-less");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const rename = require("gulp-rename");
const del = require("del");
const csso = require("gulp-csso");
const webp = require("gulp-webp");
const imagemin = require("gulp-imagemin");
const sync = require("browser-sync").create();
const uglify = require("gulp-uglify")

// Styles

const styles = () => {
  return gulp.src("source/less/style.less")
  .pipe(plumber())
  .pipe(sourcemap.init())
  .pipe(less())
  .pipe(postcss([
    autoprefixer()
  ]))
  .pipe(csso())
  .pipe(rename("style.min.css"))
  .pipe(sourcemap.write("."))
  .pipe( gulp.dest('build/css') )
  .pipe(sync.stream());
}

exports.styles = styles;

// Server

const server = (done) => {
  sync.init({
    server: {
      baseDir: 'source'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

exports.server = server;

// Server

const buildServer = (done) => {
  sync.init({
    server: {
      baseDir: 'build'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

//jsMinification

const jsmin = () => {
  return gulp.src("source/js/**/*.js")
    .pipe(uglify())
    .pipe(gulp.dest("build/js"))
};

exports.jsmin = jsmin;

// Watcher

const watcher = () => {
  gulp.watch("source/less/**/*.less", gulp.series("styles"));
  gulp.watch("source/*.html").on("change", sync.reload);
  gulp.watch("source/js/**/*.js").on("change", gulp.series("jsmin"));
}


// Image

const images = () => {
  return gulp.src("source/img/**/*.{jpg,png,svg}")
  .pipe(imagemin([
    imagemin.optipng({optimizationLevel: 3}),
    imagemin.mozjpeg({progressive: true}),
    imagemin.svgo()
  ]))
}

exports.images = images;

//Webp

const converToWebP = ( ) => {
  return gulp.src("source/img/**/*.{png,jpg}")
  .pipe(webp({quality: 75}))
  .pipe(gulp.dest("source/img"))
}

exports.webp = converToWebP;

//Clean

const clean = () => {
  return del("build");
}

exports.clean = clean;

//Copy

const copy = () => {
  return gulp.src([
  "source/fonts/**/*.{woff,woff2}",
  "source/img/**",
  "source/js/**",
  "source/*.ico",
  "source/*.html"
  ], {
    base: "source"
  })
.pipe(gulp.dest('build'))
}

exports.copy = copy;

exports.build = gulp.series(
  clean, copy, styles, images, jsmin, converToWebP, buildServer
);

exports.default = gulp.series(
  styles, server, watcher
)
