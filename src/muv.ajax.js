define([], function() {
  return {
    get: function(url) {
      return $.ajax({
        type: 'GET',
        url: url,
        cache: false,
        async: true
      });
    }
  }
});