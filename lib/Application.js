"use strict";

const {Class} = require("sdk/core/heritage");
const {Factory, Unknown} = require("sdk/platform/xpcom");
const {PageMod} = require("sdk/page-mod");
const {data, id} = require("sdk/self");
const {Cc, Ci, Cu, ChromeWorker} = require("chrome");
Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource:///modules/DirectoryLinksProvider.jsm");
Cu.import("resource://gre/modules/PlacesUtils.jsm");

const kAppUrlSet = {
  "about:newnewtab": true,
};

let NewNewTab = {
  factory: {
    contract: "@mozilla.org/network/protocol/about;1?what=newnewtab",
    Component: Class({
      extends: Unknown,
      interfaces: ["nsIAboutModule"],

      newChannel: function(uri) {
        let chan = Services.io.newChannel("chrome://newnewtab/content/html/newnewtab.html", null, null);
        chan.originalURI = uri;
        chan.owner = Services.scriptSecurityManager.getSystemPrincipal();
        return chan;
      },

      getURIFlags: function(uri) {
        return Ci.nsIAboutModule.ALLOW_SCRIPT;
      }
    })
  },

  page: {
    contentScriptFile: [
      data.url("js/contentscript.js"),
    ],
    contentScriptWhen: 'start',
    include: ["about:newnewtab"],
    onAttach: function(worker) {
    }
  }
}

let TilesPageInjector = {
  workers: [],
  mod: null,
  init: function TPI_init() {
      //TODO: get domains for pagemod
      let domains = ["*.nytimes.com"];
      TilesPageInjector.mod = PageMod(TilesPageInjector.makePageMod(domains));
  },

  makePageMod: function TPI_makePageMod(includeDomains) {
    let pageModMeta = {
      contentScriptFile: [data.url("js/fx-tiles.js")],
      contentStyleFile: [data.url("css/fx-tiles.css")],
      include: includeDomains,
      onAttach: function(worker) {
        console.debug("Application.TilesPageInjector: attached");
        TilesPageInjector.workers.push(worker);

        worker.on("detach", function() {
          TilesPageInjector.detachWorker(this);
        });
      }
    };
    return pageModMeta;
  },

  detachWorker: function TPI_detachWorker(worker) {
    let index = TilesPageInjector.workers.indexOf(worker);
    if (index != -1) {
      TilesPageInjector.workers.splice(index, 1);
    }
    console.debug("Application.TilesPageInjector: detached");
  }
};

let TilesApp = {
  start: function TA_start({loadReason}) {
    console.debug("TilesApp.start: on " + loadReason);
    TilesPageInjector.init();
    Factory(NewNewTab.factory);
    PageMod(NewNewTab.page)
  },

  unload: function TA_unload(reason) {
    console.debug("TilesApp.unload: on " + reason);
  }
};

exports.TilesApp = TilesApp;
exports.TilesPageInjector = TilesPageInjector;
