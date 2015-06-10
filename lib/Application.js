"use strict";

/**
 airdroid.com
 android.com
 androidapps.com
 androidauthority.com
 androidforums.com
 androidspin.com
 */
const {PageMod} = require("sdk/page-mod");
const {data, id} = require("sdk/self");
const {Cc, Ci, Cu, ChromeWorker} = require("chrome");
Cu.import("resource:///modules/DirectoryLinksProvider.jsm");
Cu.import("resource://gre/modules/PlacesUtils.jsm");
Cu.import("resource://gre/modules/NewTabUtils.jsm");

let TilesPageInjector = {
  workers: [],
  mod: null,
  init: function TPI_init() {
      //TODO: get domains for pagemod
      let domains = ["*.nytimes.com"];
      TilesPageInjector.mod = PageMod(TilesPageInjector.makePageMod(domains));
  },

  makePageMod: function TPI_makePageMod(includeDomains) {
    let allinks = DirectoryLinksProvider._readDirectoryLinksFile();
    let NewTabUtils = Cu.import("resource://gre/modules/NewTabUtils.jsm", {}).NewTabUtils;

    let pageModMeta = {
      contentScriptFile: [data.url("js/fx-tiles.js")],
      contentStyleFile: [data.url("css/fx-tiles.css")],
      include: includeDomains,
      attachTo: ['top'],
      onAttach: function(worker) {
        console.debug("Application.TilesPageInjector: attached");
        TilesPageInjector.workers.push(worker);
        worker.on("detach", function() {
          TilesPageInjector.detachWorker(this);
        });
        let outsnort = DirectoryLinksProvider._readDirectoryLinksFile().then(function(value){
            let places = NewTabUtils.links.getLinks();
            worker.port.emit("inject_firefox_tile", [places[0], value.suggested]);
        },
        function(reason) {
          console.error("Groink!" + reason);
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
  },

  unload: function TA_unload(reason) {
    console.debug("TilesApp.unload: on " + reason);
  }
};

exports.TilesApp = TilesApp;
exports.TilesPageInjector = TilesPageInjector;
