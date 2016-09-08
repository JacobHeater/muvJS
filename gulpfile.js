(() => {
  var gulp = require('gulp');

  require('./gulp/tasks/build');
  require('./gulp/tasks/lint');
  require('./gulp/tasks/watch');
  require('./gulp/tasks/travis');

  gulp.task('default', ['watch']);
})();
