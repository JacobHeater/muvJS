(() => {
    var gulp = require('gulp');
    var rjs = require('requirejs');
    var cache = require('gulp-cached');
    var config = {
        baseUrl: "src",
        out: "./bin/dessert.min.js",
        name: "dessert.core",
        optimize: "none"
    };
    gulp.task('build-debug', function(done) {
        gulp.src('src/**/*.js')
        .pipe(cache("dessertJS"));
        rjs.optimize(config, function(buildResponse) {
            done();
        }, done);
    });
})();