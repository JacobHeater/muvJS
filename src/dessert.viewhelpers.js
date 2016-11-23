(function () {
    "use strict";

    var $common,
        $asyncResource,
        $ajax,
        $customTag,
        attrs,
        selectors,
        utils;

    define([
        "./dessert.common",
        "./dessert.asyncresource",
        "./dessert.ajax",
        "./dessert.customtag"
    ], main);

    /**
     * Require entry point.
     * 
     * @param {Object} $common The common helper libary for dessertjs.
     * @param {Function} $asyncResource A constructor function for async resources in dessertjs.
     * @returns {Object} The object that exposes helper methods.
     */
    function main(
        common,
        asyncResource,
        ajax,
        customTag
    ) {

        $common = common;
        selectors = $common.selectors;
        utils = $common.utils;
        $asyncResource = asyncResource;
        attrs = common.attrs;
        $ajax = ajax;
        $customTag = customTag;

        return {
            renderComponent: renderComponent,
            renderControl: renderControl,
            renderExternalModule: renderExternalModule
        };
    }

    /**
     * Renders a control into the view by its given name and adds it to the dessert view object.
     * 
     * @param {Application} app The dessert application instance that the control belongs to.
     * @param {View} view The dessert view instance that the control is to be added to.
     * @param {Element} elem The element that represents the control that is to be injected into the view.
     * @param {String} controlName The name of the control to add to the view's controls dictionary.
     * @param {Element} target The DOM Element target to append the control into.
     */
    function renderControl(
        app,
        view,
        elem,
        controlName,
        target
    ) {
        app.trackedElements.add(elem);
        //If there's a target we need to first append the elem to that target.
        if (target) {
            target.append(elem);
        }
        //Add the new instance of the control to the view's controls dictionary.
        view.controls.add({
            name: controlName,
            elem: elem,
            view: view,
            app: app
        });
    }

    /**
     * Renders the component into the target element by looking up the component by name in the application's
     * component cache.
     * 
     * @param {Application} app The app instance that the component belongs to.
     * @param {View} view The view instance that the component is to be rendered in to.
     * @param {Element} target The DOM Element target that the component is to be rendered in to.
     * @param {String} componentName The name of the component to look up in the app's component cache.
     * @param {String} componentId The unique ID of the component to add to the view's component dictionary.
     * @param {Boolean} isInjection Indicates if the component is being injected into the target or replaces the target.
     */
    function renderComponent(
        app,
        view,
        target,
        componentName,
        componentId,
        isInjection
    ) {
        var componentId;
        var componentEntry;
        //Track the component for destruction later.
        app.trackedElements.add(target);
        //Find the component by name in the app configuration.
        componentEntry = app.components.get(componentName);
        //Because components require a unique name, we're going to expect that the 
        //component has an ID to identify it by.
        componentId = componentId || target.prop(attrs.id);
        /*
        Set the view's component member as a new instance of asyncResouce.
        asyncResource exposes some functionality to allow us to notify the 
        controller of when the component is interactive.
        */
        view.components[componentId] = new $asyncResource();
        if (componentEntry) {
            /*
            If the component entry is valid, then we're going to do a require call to
            get the component definition. The component definition should expose the necessary
            functions that we need to render and instantiate the component definition.
            */
            if ($common.utils.isString(componentEntry)) {
                var componentCacheEntry = app.cache.componentCache.getEntry(componentEntry);
                if (!componentCacheEntry) {
                    //This component hasn't been cached yet. Require it and then cache it.
                    //Save some network bandwidth and cache it.
                    require([componentEntry], function (_component) {
                        if (_component) {
                            //Let's instantiate the component using its constructor function.
                            var c = new _component();
                            app.cache.componentCache.addEntry(componentEntry, c);
                            initializeComponent(view, c, componentId, target, app, isInjection);
                        }
                    });
                } else {
                    //We need the component initialization to perform as if it was a require call, which
                    //by nature is asynchronous. Therefore, we'll add this function the the event queue,
                    //and get it off the main thread.
                    $common.utils.defer(function () {
                        initializeComponent(view, componentCacheEntry, componentId, target, app, isInjection);
                    });
                }

            } else if ($common.utils.isFunction(componentEntry)) {
                /*
                This scenario allows for users to pass functions in as the 
                component definition, instead of relying on require to go out
                and get the component definition, we can directly get the constructor
                function for the component and instantiate it. This use case behaves
                exactly the same as the scenario above, but allows for direct
                consumption of the component constructor function.
                */
                $common.utils.defer(function () {
                    var c;
                    var componentCacheEntry = app.cache.componentCache.getEntry(componentName);
                    if (!componentCacheEntry) {
                        c = new componentEntry();
                        app.cache.componentCache.addEntry(componentName, c);
                    } else {
                        c = componentCacheEntry;
                    }
                    initializeComponent(view, c, componentId, target, app, isInjection);
                });
            }
        }
    }

    /**
     * Renders a view from an external source into the given
     * target DOM Element. 
     * 
     * @param {Application} app The application instance where the target DOM element is a member of.
     * @param {String} url The URL of the view to render.
     * @param {Element} target The DOM Element to render the view into.
     * @param {Function} done The callback to call when the rendering is done.
     */
    function renderExternalModule(app, url, target, done) {
        url = utils.cleanPath(url);
        //Make sure that the url doesn't contain any undefined vars because something didn't get replaced properly.
        if (url && !((/undefined/g).test(url))) {
            var moduleCacheEntry = app.cache.externalModuleCache.getEntry(url);

            if (!moduleCacheEntry) {

                if (app.providers.jquery) {
                    $ajax.jquery = app.providers.jquery;
                }

                $ajax
                    .get(url)
                    .done(function (html) {
                        //Add a cache entry for this external module. We don't want
                        //to make another round trip for this entry.
                        app.cache.externalModuleCache.addEntry(url, html);
                        //Build out the module with this html now.
                        parseExternalModuleHtml(html, target, app);
                    })
                    .fail(function (xhr) {
                        //Handle any errors here by looking up any error handlers in the 
                        //application httpHandlers cache.
                        if (target.is(selectors.page)) {
                            //If you target object is the single page element, then we need to handle that here.
                            app
                                .httpHandlers
                                .page
                                .getHandlersByStatusCode(xhr.status)
                                .forEach(function externalModuleInitFailForEach(h) {
                                    h.handler(xhr, $routing);
                                });
                        }
                    })
                    .always(utils.isFunction(done) ? done : function () {});

            } else {
                //There was a cache entry for this external module.
                //Build out the module with the cached html.
                parseExternalModuleHtml(moduleCacheEntry, target, app);
                done();
            }
        }
    }

    /**
     * Parses the HTML from the external module and renders
     * it into the target DOM element.
     * 
     * @param {String} html The HTML to render into the target DOM element.
     * @param {Element} target The DOM element to render the HTML into.
     * @param {Application} app The app instance that the target is a member of.
     */
    function parseExternalModuleHtml(html, target, app) {
        //We got the html back from the server, let's build it out.
        var $elem = $(html);

        //It's possible that the HTML is just a block of text, which in this case,
        //We need to present it as text, and not a HTML element.
        if ($elem.length === 0 && typeof html === "string" && html.trim().length) {
            $elem = html;
        }

        //Replace the [dsrt-src] element with the newly created element from our server call.
        //Don't replace it if this is the page element. We need to be able to find this later.
        if (target.is(selectors.page)) {
            target.setContent($elem);
            target.removeAttr(attrs.src);
        } else if (target.attr("embed") && target.attr("embed").toLowerCase() === "true") {
            target.setContent($elem);
            target.removeAttr(attrs.src);
        } else {
            target.replaceContent($elem);
        }
        $customTag.init(app);
    }

    /**
     * Initializes the component by calling the component's renderer and 
     * either injects it into or replaces the target with the rendered component.
     * 
     * @param {View} view The dessert view instance that the component belongs to.
     * @param {Component} component The dessert component that is to be rendered.
     * @param {String} componentId The unique identifier of the component to notify once it's rendered.
     * @param {Element} $component The DOM Element that represents the component target host element.
     * @param {Application} app The dessert application instance to lookup the component from.
     * @param {Boolean} isInjection Determines if the component is to be injected into or replace the target element.
     */
    function initializeComponent(view, component, componentId, $component, app, isInjection) {
        /*
        There must be both a component and $component (target element) to render and to be rendered to.
        The component is the dessert.component instance and the $component is the DOM element that the
        component is going to be rendered to.
        */
        if (component && $component) {
            /*
            The component should have a render function that does its 
            work to render its view. When the component view is rendered,
            they can invoke our callback and give us the view for passing
            it into its constructor.
            */
            component.render(function (componentView) {
                //The view is rendered, and we have the view.s
                //Replace the [dsrt-component] element with the view element.
                if (isInjection) {
                    $component.append(componentView);
                } else {
                    $component.replaceContent(componentView);
                }
                //Call the component instance's constructor function that
                //exposes the components functionality.
                var _component = new component.constructor(componentView);

                if (app.providers.IDataBindingProvider) {
                    _component.bindTemplateToData = app.providers.IDataBindingProvider.bindTemplateToData;
                }

                if (Array.isArray(component.constructorInstances)) {
                    //Push this instance into the instance cache.
                    component.constructorInstances.push(_component);
                }
                /*
                Using the asyncResouce .notify() function, we can 
                now notify the controller that the component is 
                interactive and give it the component as the "this"
                arg. We'll also pass in the component as the first argument.
                */
                view.components[componentId].notify(_component, [_component]);
            });
        }
    }
})();