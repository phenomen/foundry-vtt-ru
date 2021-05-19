const gulp = require('gulp');
const merge = require('gulp-merge-json');

function defaultTask(cb) {

    gulp.src('./i18n/modules/*.json')
        .pipe(merge())
        .pipe(gulp.dest('./dist'));

    cb();
}

exports.default = defaultTask