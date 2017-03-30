var gulp = require('gulp');

// 拷贝自定义目录
gulp.task('cp', function () {
    gulp.src('demo/**/*.*')
        .pipe(gulp.dest('public/demo'));
});

gulp.task('default', ['cp']);