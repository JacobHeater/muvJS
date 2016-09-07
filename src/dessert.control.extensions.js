/**
@file Extensions of the dessertJS Control, which be nature is just a jQuery object. 
These are simply just extensions of the jQuery object, which are added to the dsrt "namespace."
@author Jacob Heater
*/
define("dessert.control.extensions", [
    'dessert.control.repeat',
    'dessert.common',
    'dessert.ajax',
    "jquery"
], function(repeater, common, ajax, $) {

    "use strict";

    var attrs = common.attrs;
    //The $ factory element result to extend with the dsrt object.
    return function(element) {
        /**
         * Binds the control to the given model using event driven
         * data binding. This is unlike two-way data binding because
         * this is not dirty checking. This is synchronization with native
         * DOM events.
         * 
         * @param {Object} model The data model to bind.
         * @returns {Object} The current dsrt control instance for chaining.
         */
        element.dsrt.bind = function(model) {
            if (model) {
                //First init the control with the model value
                element.val(model[element.attr(attrs.control)]);
                //Then set the handler to track the changes.
                element.on('keyup keydown change', function() {
                    //TODO: Handle different types of controls such as SELECT and RadioButton
                    model[$(this).attr(attrs.control)] = ($(this).val() || $(this).text());
                });
            }
            return this;
        };
        /**
         * Adds an event listener to watch for any changes in the control.
         * This is a fairly comprehensive set of event listeners to listen for,
         * therefore, watchers should be pretty concise.
         * 
         * @param {Function} watcher The function to fire when the event has been raised.
         * @returns {Object} The current instance of the dsrt control for chaining.
         */
        element.dsrt.watch = function(watcher) {
            if (typeof watcher === 'function') {
                element.on('keyup keydown change', function() {
                    watcher.call($(this));
                });
            }
            return this;
        };
        /**
         * TODO: reinvestigate why this is necessary.
         */
        element.dsrt.src = function(path) {
            return {
                path: path
            };
        };
        /**
         * Adds the native jQuery .on() method to the dsrt namespace
         * for easier chaining of dsrt methods.
         * 
         * @param {String} event The name(s) of the event(s) to listen for.
         * @param {Function} handler The function to invoke when the event has been raised.
         * @returns {Object} The current instance of the dessertJS control for chaining.
         */
        element.dsrt.on = function(event, handler) {
            element.on(event, handler);
            return this;
        };
        /**
         * Gives the ability to escape out to the $.fn namespace to hook into
         * additional jQuery methods. This is convenient because it allows for
         * easier chaining between the element .dsrt namespace and the element .fn
         * namespace.
         * 
         * @type {Object}
         */
        element.dsrt.jq = element;
        /**
         * Loads a module asynchronously from the given path and executes the function
         * after the module has been loaded.
         * 
         * @param {String} path The url of the path to load asynchronously.
         * @param {Function} callback The function to invoke when the module has been loaded.
         */
        element.dsrt.load = function(path, callback) {
            var app = element.dsrt.view.controller.module.app;
            var dsrtPath = app.dsrtPath;
            require([
                dsrtPath.concat('dsrt.context.init'),
                dsrtPath.concat('dsrt.externalmodules.init')
            ], function(contextInit, externalInit) {
                ajax.get(path.path)
                    .then(function(data) {
                        element.children().remove();
                        element.append(data);
                        var asyncInit = externalInit(element, app);
                        asyncInit(0, function() {
                            contextInit(element, element.dsrt.view.controller.module.app, {}, callback);
                        });
                    });
            });
        };
        /**
         * Gets the outer HTML of the provided jQuery object instance.
         * 
         * @param {Object} $elem The jQuery object instance to get the outer HTML of.
         * @returns {String} The outer HTML of the DOM element.
         */
        element.dsrt.outerHtml = function($elem) {
            return common.utils.getOuterHtml($elem);
        };
        /**
         * Repeats the given template over the given sequence for n times
         * where n is the length of the sequence.
         * 
         * @function
         * @param {any[]} sequence The sequence or data set to enumerate.
         * @param {String|Object} template The template to repeat into the control.
         * @param {Object} config The configuration for the repeater. 
         */
        element.dsrt.repeat = repeater(element);
    };
});