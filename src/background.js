// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// const purityAPIURL = 'http://127.0.0.1:8080'

// Replacement image for obscene images.
const fillerImgURL = 'https://ichef.bbci.co.uk/news/410/cpsprodpb/16620/production/_91408619_55df76d5-2245-41c1-8031-07a4da3f313f.jpg'

// Agrregate the img URIs to send to backend.
const imgURIList = []

// Can't use async callbacks in Chromium.
// https://github.com/mozilla/webextension-polyfill/issues/225#issuecomment-612495680
// function asyncRedirect () {
//   return new Promise((resolve, reject) => {
//     window.setTimeout(() => {
//       resolve({
//         redirectUrl: fillerImgURL
//       })
//     }, 1000)
//   })
// }

// Main is called when the extension is loaded.
const main = async () => {
  console.log('Purity web extension is now installed.')
  let settings

  // Grab the user domain filter settings to filter on certain domains.
  try {
    settings = await getLocalStorage(null)
  } catch (err) {
    console.err(err)
    return
  }

  browser.storage.onChanged.addListener(changes => {
    if (changes.domains) {
      console.log(`User domain list changed from ${settings.domains} to ${changes.domains.newValue}`)
      settings.domains = changes.domains.newValue
    }
  })

  browser.webRequest.onBeforeRequest.addListener(req => {
    const reqDomain = (new URL(req.initiator)).hostname

    // If an image is a candidate for being filtered.
    // Candidacy is based on the initiator domain matching the user's domain list.
    const isToBeFiltered = settings.domains.includes(reqDomain)

    if (isToBeFiltered) {
      imgURIList.push(req.url)
      return {
        redirectUrl: fillerImgURL
      }
    }
  },
  {
    urls: ['<all_urls>'],
    types: ['image']
  }, ['blocking'])

  // When HTML page is completely loaded, validate the imgURIList, then interface with the backend
  // to filter the images.
  // TODO: ensure this event CANNOT fire before all the image requests have been started.
  // browser.webRequest.onCompleted.addListener(async details => {
  //  const url = `${purityAPIURL}/filter`

  // test data.
  // const body = {
  //   imgUriList: [
  //     // Bikini photo
  //     "https://i.imgur.com/gcWltJm.jpg",

  //     // Harmless photo
  //     "https://previews.123rf.com/images/valio84sl/valio84sl1311/valio84sl131100006/23554524-autumn-landscape-orange-trre.jpg",

  //     // WARNING: explicit
  //     "https://i.imgur.com/Vdob7RN.jpg"
  //   ]
  // }

  // const body = { imgURIList }

  // const res = await fetch(url, {
  //   method: 'POST',
  //   body: JSON.stringify(body)
  // })
  // console.log(await res.json())
  // },
  // {
  //  urls: ['<all_urls>'],
  //  types: ['main_frame']
  // })
}

// Wrapper function to make interfacing with the browser.storage API more "synchronous".
const getLocalStorage = keys => {
  return browser.storage.local.get(keys)
}

browser.runtime.onInstalled.addListener(main)
