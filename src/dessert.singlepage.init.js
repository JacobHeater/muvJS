define("dessert.singlepage.init", ['dessert.routing', 'dessert.common'], function(routing, common) {
    
    "use strict";
    
    var attrs = common.attrs;
    return function(app, $page) {
        var path = routing.getRoute();
        var args = routing.getParams();
        if (path && args) {
            $page.attr(attrs.src, path);
            app.pageInit(args);
        }
    };
});