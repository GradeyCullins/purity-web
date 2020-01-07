// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

const fillerImgURL = "https://ichef.bbci.co.uk/news/410/cpsprodpb/16620/production/_91408619_55df76d5-2245-41c1-8031-07a4da3f313f.jpg"

chrome.runtime.onInstalled.addListener(function() {
  console.log("Installed.");

  chrome.webRequest.onBeforeRequest.addListener(details => {
    return {
      redirectUrl: fillerImgURL
    }
  }, 
  {
    urls: ["<all_urls>"],
    types: ["image"]
  }, ["blocking"] )
});