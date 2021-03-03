// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

const purityAPIURL = 'http://127.0.0.1:8080'

// Replacement image for obscene images.
const fillerImgURL = 'https://ichef.bbci.co.uk/news/410/cpsprodpb/16620/production/_91408619_55df76d5-2245-41c1-8031-07a4da3f313f.jpg'

// Agrregate the img URIs to send to backend.
const imgURIList = []

// Wrapper function to make interfacing with the chrome.storage API more "synchronous".
const getUsrSettings = () => {
  return new Promise(resolve => {
    chrome.storage.local.get(data => {
      resolve(data)
    })
  })
}

chrome.runtime.onInstalled.addListener(async details => {
  console.log('Purity web extension is now installed.')

  // Grab the user domain filter settings to filter on certain domains.
  const settings = await getUsrSettings()

  chrome.webRequest.onBeforeRequest.addListener(req => {
    if (req.url !== fillerImgURL && !imgURIList.includes(req.url)) {
      imgURIList.push(req.url)
    }

    if (settings.domains.includes(req.initiator)) {
      console.log(`blocking ${req.url} from ${req.initiator}`)
    }

    return {
      // redirectUrl: fillerImgURL
      cancel: settings.domains.includes(req.initiator)
    }
  },
  {
    urls: ['<all_urls>'],
    types: ['image']
  }, ['blocking'])

  // When HTML page is completely loaded, validate the imgURIList, then interface with the backend
  // to filter the images.
  // TODO: ensure this event CANNOT fire before all the image requests have been started.
  // chrome.webRequest.onCompleted.addListener(async details => {
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
})
