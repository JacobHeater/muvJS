(function () {
    "use strict";

    define([
        "jquery"
    ], todoControllerModule);

    function todoControllerModule($) {
        return function addTodoControllerToModule(todoModule) {
            var controller = todoModule.controller("todoController", function () {

                var view;
                var viewData;
                var resolveToDoLists = function () {
                    this.setPlaceholder("Enter task name...");
                };
                var initView = function () {
                    view.components.todo1.resolve(resolveToDoLists);
                    view.components.todo2.resolve(resolveToDoLists);
                    view.controls.btnInsertLeft.click(function () {
                        var id = prompt("Enter an id for the todo list...");
                        view.controls.panelLeft.dsrt.inject({
                            type: "component",
                            name: "todoList",
                            id: id
                        });

                        view.components[id].resolve(resolveToDoLists);
                    });

                    view.controls.btnInsertRight.click(function() {
                        var id = prompt("Enter an id for the todo list...");
                        view.controls.panelRight.dsrt.inject({
                            type: "component",
                            name: "todoList",
                            id: id
                        });

                        view.components[id].resolve(resolveToDoLists);
                    });
                };

                this.scope = function ($scope) {
                    view = $scope.view;
                };

                this.isAsync = true;
                this.init = function () {
                    $.get("./json/view-data.json")
                        .then(function (data) {
                            viewData = data;
                        })
                        .fail(function () {
                            viewData = {
                                title: "Error getting view-data.json!'"
                            };
                        })
                        .always(function () {
                            this.notify();

                            initView();
                        }.bind(this));
                };

                this.initData = function () {
                    return viewData;
                };
            });

            return controller;
        };
    }

})();