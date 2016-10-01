define(function () {
  "use strict";

  return function (model, view, controller) {
    var controls = view.controls;
    var btnLogin = controls.btnLogin;
    var userName = controls.userName;
    var password = controls.password
    var lblErrorMsg = controls.lblErrorMsg;
    view.configureEvents('onLogin');
    userName.dsrt.bind(model);
    password.dsrt.bind(model);
    view.invalidate = function () {
      lblErrorMsg.html("<b>User Name and Password are required!</b>");
    };
    btnLogin.click(function () {
      view.onLogin.trigger(model);
    })
  };
});