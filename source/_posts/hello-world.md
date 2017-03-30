---
title: gulp 简单开发流程配置
date: 2017-03-16 11:40:56
tags:
---



```
var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var imagemin = require('gulp-imagemin');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var rev = require('gulp-rev');
var del = require('del');
var revReplace = require('gulp-rev-replace');
var colors = require('colors');
var minifyCss = require('gulp-minify-css');
var htmlmin = require('gulp-htmlmin');
var declare = require('gulp-declare');
var concat = require('gulp-concat');
var hoganCompiler = require('gulp-hogan-precompile');

// 开发用
gulp.task('server', function () {
    browserSync.init({
        server: {
            baseDir: 'src_nohead/'
        }
    });
    browserSync.watch("src_nohead/css/**/*.css", function (event, file) {
        if (event === "change") {
            browserSync.reload("*.css");
        }
    });
    browserSync.watch("src_nohead/js/**/*.js", function (event, file) {
        if (event === "change") {
            browserSync.reload("*.js");
        }
    });
    browserSync.watch("src_nohead/**/*.html").on("change", browserSync.reload);

    gulp.watch('src_nohead/hogan/**/*.hgn').on('change', function () {
        gulp.src('src_nohead/hogan/**/*.hgn')
            .pipe(hoganCompiler())
            .pipe(declare({
                namespace: 'templates',
                noRedeclare: true
            }))
            .pipe(concat('templates.js'))
            .pipe(gulp.dest('src_nohead/js/'));
    });
});

// 删除上次发布内容
gulp.task('del', function () {
    // 使用同步方法，异步会有问题
    del.sync(['dist/*', 'rev-manifest.json'], function (err, paths) {
        console.log('delete file/folder:\n', colors.cyan(paths.join('\n')));
    });
});

// js压缩 改名 发布
gulp.task('js', function (cb) {
    return gulp.src('src_nohead/**/js/*.js')
    // .pipe(sourcemaps.init({
    //     loadMaps: true
    // }))
        .pipe(uglify({
            output: {
                ascii_only: true
            },
        }))
        .pipe(rev())
        // .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('dist/'))
        .pipe(rev.manifest({
            base: '',
            merge: true
        }))
        .pipe(gulp.dest(''));
});

// css压缩 改名 发布
gulp.task('css', function () {
    return gulp.src('src_nohead/**/*.css')
        .pipe(minifyCss())
        .pipe(rev())
        .pipe(gulp.dest('dist/'))
        .pipe(rev.manifest({
            base: '',
            merge: true
        }))
        .pipe(gulp.dest(''));
});

// 图片压缩及发布
gulp.task('image', function () {
    return gulp.src(['src_nohead/**/*.png', 'src/**/*.jpg', 'src/**/*.gif'])
        .pipe(imagemin({
            progressive: true,
            interlaced: true
        }))
        .pipe(gulp.dest('dist/'));
});

gulp.task('html', ['js', 'css'], function () {
    var manifest = gulp.src('rev-manifest.json');
    var fixManifest = gulp.src('fix-manifest.json');
    return gulp.src('src_nohead/**/*.html')
        .pipe(revReplace({
            replaceInExtensions: ['.html'],
            manifest: manifest
        }))
        // .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest('dist'));
});

gulp.task('other', function () {
    return gulp.src(['src_nohead/**/lib/*.js', 'src/**/*.json'])
        .pipe(gulp.dest('dist/'));
});


// 默认任务即为发布
gulp.task('default', ['del', 'js', 'css', 'image', 'html', 'other']);
```