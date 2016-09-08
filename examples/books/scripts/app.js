define([
  'dessert.core'
], function(dessert) {
  "use strict";
  return dessert
    .app('books')
    .onInit(function() {
      this.src = "./views/";
      this.templates = "./templates/";
      this.dessertPath = "./scripts/dessert/";
    })
    .cache()
    .ready();

});