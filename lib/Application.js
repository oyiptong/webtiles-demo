"use strict";

const {Class} = require("sdk/core/heritage");
const {Factory, Unknown} = require("sdk/platform/xpcom");
const {PageMod} = require("sdk/page-mod");
const {data, id} = require("sdk/self");
const {Cc, Ci, Cu, ChromeWorker} = require("chrome");
Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource:///modules/DirectoryLinksProvider.jsm");
Cu.import("resource://gre/modules/PlacesUtils.jsm");
Cu.import("resource://gre/modules/NewTabUtils.jsm");

const kAppUrlSet = {
  "about:newnewtab": true,
};

const kNumLinks = 12;

let NewNewTab = {
  workers: new WeakSet(),
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
    contentScriptWhen: 'ready',
    include: ["about:newnewtab"],

    onAttach: worker => {
      console.debug("Application.NewNewTab: attached");

      NewNewTab.workers.add(worker);
      worker.once('detach', _ => {
        NewNewTab.workers.delete(worker);
      });

      worker.port.on("gridReady", _ => {
        var links = NewTabUtils.links.getLinks().slice(0, kNumLinks);
        worker.port.emit("tilesData", links);
      });
    }
  }
}

let TilesPageInjector = {
  workers: new WeakSet(),
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
        TilesPageInjector.workers.add(worker);
        worker.once("detach", _ => {
          TilesPageInjector.workers.delete(worker);
        });
      }
    };
    return pageModMeta;
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
