var gulp  = require('gulp')
var stripDebug = require('gulp-strip-debug')

gulp.task('stripDebug', function () {
    return gulp.src('dist/md-data-table.js')
        .pipe(stripDebug())
        .pipe(gulp.dest('dist'));
});
