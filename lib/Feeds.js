"use strict";

const {Request} = require("sdk/request");
const {storage} = require("sdk/simple-storage");
const {Cc, Ci, Cu, ChromeWorker} = require("chrome");
Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/NetUtil.jsm");
const kIDNService = Cc["@mozilla.org/network/idn-service;1"].getService(Ci.nsIIDNService);
const kFeedNumItems = 10;
const kFeedTTLMillis = 10 * 60 * 1000;
const kFeeds = {
  "nytimes.com": "http://www.nytimes.com/services/xml/rss/nyt/HomePage.xml",
  "cnn.com": "http://rss.cnn.com/rss/cnn_topstories.rss",
  "qz.com": "http://qz.com/feed/",
  "arstechnica.com": "http://feeds.arstechnica.com/arstechnica/index/",
  "theglobeandmail.com": "http://www.theglobeandmail.com/?service=rss",
  "bbc.com": "http://feeds.bbci.co.uk/news/rss.xml",
  "economist.com": "http://www.economist.com/sections/business-finance/rss.xml",
  "news.ycombinator.com": "https://news.ycombinator.com/rss"
};


let FeedReader = {

  init : function FR_init() {
    if (storage.feedCache == null) {
      storage.feedCache = {};
    }
  },

  feedFromLink: function FR_feedFromLink(link) {
    let promise = new Promise(function (resolve, reject) {
      FeedReader.feedFromURL(link.url).then(function(feed) {
        link.entries = feed.feed.entries;
        resolve(link);
      });
    });
    return promise;
  },

  feedFromURL: function FR_feedFromURL(url) {
    let uri = NetUtil.newURI(url);
    let host = uri.host;
    try {
      let feedKey = null;

      if (host in kFeeds) {
        feedKey = host;
      }
      else {
        let baseDomain = Services.eTLD.getBaseDomainFromHost(host);
        let domainName = kIDNService.convertToDisplayIDN(baseDomain, {});
        if (domainName in kFeeds) {
          feedKey = domainName;
        }
      }

      if (feedKey != null) {
        let now = new Date();
        if (feedKey in storage.feedCache && ((now - storage.feedCache[feedKey].date) <= kFeedTTLMillis)) {
          // read from cache if < TTL
          return new Promise(function(resolve, reject) {
            resolve(storage.feedCache[feedKey].content);
          });
        }

        let feedURL = kFeeds[feedKey];
        return FeedReader.get(feedKey, feedURL);
      }
    }
    catch (e) {
      console.error(e);
      return new Promise(function(resolve, reject) {
        reject();
      });
    }

    return new Promise(function(resolve, reject) {
      resolve(null);
    });
  },

  get: function FR_get(feedKey, feedURL) {
    let promise = new Promise(function(resolve, reject) {
      let url = "https://ajax.googleapis.com/ajax/services/feed/load?v=1.0&num="+ kFeedNumItems +"&q=" + feedURL;
      try {
        let feedData = Request({
          url: url,
          headers: {Referer: "https://mozilla.org"},
          onComplete: response => {
            let resp = response.json;
            if (resp && resp.responseStatus == 200) {
              storage.feedCache[feedKey] = {
                date: new Date(),
                content: Cu.cloneInto(resp.responseData, FeedReader)
              }
              resolve(storage.feedCache[feedKey].content);
              return;
            }

            // not an acceptable response
            console.error("FR_get: googleapis.com call failed");
            reject();
          }
        }).get();
      }
      catch (e) {
        console.error("FR_get failed");
        reject(e);
      }
    });
    return promise;
  }
};

exports.feeds = kFeeds;
exports.FeedReader = FeedReader;
