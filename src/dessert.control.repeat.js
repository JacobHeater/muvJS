/**
@file Defines the repeat method which is defined in the dsrt.control.extensions module.
@author Jacob Heater
*/
define("dessert.control.repeat", [
    'dessert.databinding',
    'dessert.ajax',
    'dessert.common',
    "jquery"
], function(db, ajax, common, $) {

    "use strict";
    
    var selectors = common.selectors;

    /**
     * Creates a closure and returns a function that aids in repeating
     * the given template using the data set.
     * 
     * @param {Object} element The jQuery object instance.
     * @returns {Function} A closure that is used to repeat the template.
     */
    return function(element) {
        /**
         * Enumerates over the given sequence or data set, and injects the template
         * content into the DOM element.
         * 
         * @param {any[]} sequence The data set to enumerate over.
         * @param {Object|String} template The template to repeat into the DOM element.
         * @param {Object} config The configuration for the repeater.
         * @returns {Object} The current dessertJS control for chaining.
         */
        return function(sequence, template, config) {
            var iterateSequence;
            var bindTemplate;
            var bindable;
            var outer;
            var $bindable;
            var $output = [];
            var $elem;
            var _config = $.extend({
                clear: true
            }, config);
            var buildOutput = function(output) {
                var html = output.map(function(elem) {
                    return $('<div />').append($(elem).clone()).html();
                }).join('');
                if (_config.clear === true) {
                    element.children().remove();
                }
                element.append(!!outer ? outer.append(html) : html);
            };
            if (sequence && sequence.length) {
                iterateSequence = function(callback) {
                    for (var i = 0; i < sequence.length; i++) {
                        callback(sequence[i]);
                    }
                };
                bindTemplate = db.bindTemplate;
                if (typeof template === 'string') {
                    bindable = template;
                    outer = "";
                    $bindable = $(bindable);
                    if ($bindable.find(selectors.rpt).length === 1) {
                        bindable = $bindable.find(selectors.rpt).eq(0).html();
                        $bindable.find(selectors.rpt).remove();
                        outer = $bindable;
                    }
                    iterateSequence(function(obj) {
                        $elem = bindTemplate(bindable, obj);
                        $output.push($elem);
                    });
                    buildOutput($output);
                } else if (typeof template === 'object') {
                    ajax.get(template.path)
                        .then(function(data) {
                            bindable = data;
                            outer = "";
                            $bindable = $(bindable);
                            if ($bindable.find(selectors.rpt).length === 1) {
                                bindable = $bindable.find(selectors.rpt).eq(0).html();
                                $bindable.find(selectors.rpt).remove();
                                outer = $bindable;
                            }
                            iterateSequence(function(obj) {
                                $elem = bindTemplate(bindable, obj);
                                $output.push($elem);
                            })
                            buildOutput($output);
                        });
                }
            }
            return this;
        }
    };
})