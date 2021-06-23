const gulp = require('gulp');
const merge = require('gulp-merge-json');
const flatten = require('gulp-flat');

gulp.task('merge',
    () => gulp.src('./i18n/modules/*.json')
		 .pipe(merge())
         .pipe(gulp.dest('dist'))
);

gulp.task('flatten',
    () => gulp.src('./temp/unflattened/*.json')
		 .pipe(flatten())
         .pipe(gulp.dest('./temp/flattened/'))
);

