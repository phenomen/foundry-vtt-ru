var gulp = require('gulp');
var merge = require('gulp-merge-json');

function defaultTask(cb) {

    gulp.src('./source/*.json')
        .pipe(merge())
        .pipe(gulp.dest('./dist'));

    cb();
}

exports.default = defaultTask