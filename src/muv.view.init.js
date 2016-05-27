define(['./muv.common', './muv.view', './muv.control', './muv.model'], function(common, View, Control, Model) {
    var selectors = common.selectors;
    var attrs = common.attrs;
    return function($controller, controller, module, $module, app, args, page, callback) {
        var views;
        if ($controller) { //If no controller, we'll consider it a partial view.
            views = $controller.find(selectors.view);
        } else { //Look in the module definition for partial views.
            views = $module.find(selectors.view);
        }
        var $view;
        var controls;
        var view;
        var modelMembers;
        var models;
        var $model;
        var $control;
        var controlName;
        var control;
        var model;
        var muvController;
        views.each(function(k) {
            $view = $(this);
            controls = $view.find(selectors.control);
            view = new View($view.attr(attrs.view), controller, $view);
            modelMembers = {};
            models = $view.find(selectors.model);
            models.each(function(l) {
                $model = $(this);
                modelMembers[$model.attr(attrs.control)] = "";
            });
            controls.each(function(l) {
                $control = $(this);
                controlName = $control.attr(attrs.control);
                control = new Control(controlName, $control, view);
                view.controls.add(control);
            });
            //Instantiate the controller constructor
            model = new Model(modelMembers);
            if (typeof callback === 'function') {
                muvController = callback(view, model, module, page);
            } else {
                muvController = new controller.ctor(view, model, module, page);
            }
        });
        $(selectors.mask).show();
    };
})