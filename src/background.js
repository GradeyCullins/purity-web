// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import { getLocalStorage } from './storage.js'

let settings = { domains: [] }

// Agrregate the img URIs to send to backend.
let imgURIList = []

// After the page is loaded, send the img URI list to the API for filtering.
browser.webNavigation.onCompleted.addListener(async () => {
  try {
    // Get the currently active tab.
    const tabs = await browser.tabs.query({ currentWindow: true, active: true })
    if (tabs.length === 0) {
      return
    }
    const tab = tabs[0]

    // Send the img data to the active tab content script for filtering.
    await browser.tabs.sendMessage(tab.id, { imgURIList })

    // Clear the imgURIList for the next page load.
    imgURIList = []
  } catch (err) {
    console.log(err.message)
  }
})

browser.storage.onChanged.addListener(changes => {
  if (changes.domains) {
    console.log(`User domain list changed from ${settings.domains} to ${changes.domains.newValue}`)
    settings.domains = changes.domains.newValue
  }
})

async function initWithMessage () {
  console.log('Purity extension is running')

  // Grab the user domain filter settings to filter on certain domains.
  try {
    settings = await getLocalStorage(null)
  } catch (err) {
    console.error(err)
  }
}

browser.runtime.onStartup.addListener(initWithMessage)
browser.runtime.onInstalled.addListener(initWithMessage)

// Can't use async callbacks in Chromium.
// https://github.com/mozilla/webextension-polyfill/issues/225#issuecomment-612495680
browser.webRequest.onBeforeRequest.addListener(req => {
  console.log(settings.domains)
  const reqDomain = (new URL(req[!chrome ? 'originUrl' : 'initiator'])).hostname

  // If an image is a candidate for being filtered.
  // Candidacy is based on the initiator domain matching the user's domain list.
  if (settings.domains.includes(reqDomain)) {
    imgURIList.push(req.url)
    return {
      cancel: true
    }
  }
},
{
  urls: ['<all_urls>'],
  types: ['image']
}, ['blocking'])
