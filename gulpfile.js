const gulp = require('gulp');
const merge = require('gulp-merge-json');
const flatten = require('gulp-flat');

function defaultTask(cb) {

    gulp.src('./i18n/en_US/*.json')
        .pipe(flatten())
        .pipe(gulp.dest('./i18n/en_US'))

    gulp.src('./i18n/ru_RU/*.json')
        .pipe(flatten())
        .pipe(gulp.dest('./i18n/ru_RU'))

    gulp.src('./i18n/ru_RU/*.json')
        .pipe(merge())
        .pipe(gulp.dest('./dist'));

    cb();
}

exports.default = defaultTask