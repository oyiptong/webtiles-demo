const {TilesApp} = require("Application");

exports.main = function(options, callbacks) {
  TilesApp.start(options);
};

exports.onUnload = function(reason) {
  TilesApp.unload(reason);
};
