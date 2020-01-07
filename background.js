// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Not sure if this works.
// chrome.storage.local.set({yikes: 'neocondon'});

// chrome.webRequest.onBeforeRequest.addListener(
//   function(details) {
//     console.log(details.url)
//     return {cancel: details.url.indexOf("://www.gradeycullins.com/") != -1};
//   },
//   {urls: ["<all_urls>"]},
//   ["blocking"]);

chrome.runtime.onInstalled.addListener(function() {
  console.log("Installed.");


  chrome.webRequest.onBeforeRequest.addListener(details => {
    return {
      redirectUrl: "https://tinyurl.com/yh33bnb9"
    }
  }, 
  {
    urls: ["https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png"],
    types: ["image"]
  }, ["blocking"] )
});