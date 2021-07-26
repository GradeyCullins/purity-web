import { filterImages, health } from './api.js'

export const onDocLoad = docLoadHandler

export function main () {
  // if (document.readyState === 'complete') {
  //   document.addEventListener('load', onDocLoad)
  // } else {
  //   onDocLoad()
  // }
  // TODO: clean this up
  onDocLoad()
}

async function docLoadHandler () {
  const domainList = (await browser.storage.local.get(null)).domains

  // Don't do image filtering if the current tab URL is not in the domain whitelist.
  if (!domainList.includes(window.location.hostname)) {
    return
  }

  // Don't do image filtering if the backend is not reachable.
  const res = await health()
  if (res.status !== 200) {
    return
  }

  // TODO: get imgs from other sources like background-image
  const imgList = [...document.getElementsByTagName('img')]

  // Async call to filter images as <img> tags.
  filterImgTags(imgList)
}

async function filterImgTags (imgList) {
  if (imgList.length === 0) {
    return
  }

  // Temporarily not pre-filtering images to see how it goes.
  // Run all the images through the filter and change their src attrs to be the placeholder img URI.
  // updateImgListSrc(imgList)

  const imgURIList = []
  for (const img of imgList) {
    imgURIList.push(img.src)
  }

  try {
    const res = await filterImages(imgURIList)
    if (res.status !== 200) {
      console.error(`Failed to get response from API with status ${res.status}`)
      return
    }
    const imgFilterResList = await res.json()
    const filteredImgResList = imgFilterResList.filter(res => !res.passed)
    const filteredImgList = imgList.filter(img => {
      const filterRes = filteredImgResList.find(res => res.imgURI === img.src)
      img.setAttribute('reason', filterRes.reason) // Attach metadata to the HTML node for more detailed feedback in the UI.
      return filterRes && !filterRes.pass
    })

    for (const img of filteredImgList) {
      const parent = img.parentElement
      const warningNode = document.createElement('p')
      warningNode.classList.add('warning-tag')
      warningNode.innerHTML = `
⚠️ Google Vision Detected <span class="fail-reason-text">${img.getAttribute('reason')}</span> content in this image. <button id='${img.src}'>show</button>`
      parent.insertBefore(warningNode, img)
      img.classList.add('blurred-img')
      const button = document.getElementById(img.src)
      button.addEventListener('click', () => img.classList.toggle('blurred-img'))
    }
  } catch (err) {
    console.log(err)
  }
}


// TODO: rename function as it no longer changes image src attr.
// Warning: function has side-effects!
// Take list of img elements and change their image src attribute to be of value "src".
export function updateImgListSrc (imgList) {
  for (const img of imgList) {
    const parent = img.parentElement
    const warningNode = document.createElement('p')
    warningNode.innerText = '⚠️ Google Vision Detected explicit content in this image. Click here to show the image.'
    parent.insertBefore(warningNode, img)
    img.classList.add('blurred-img')
  }
}

// browser.runtime.onMessage.addListener(onRecvMsg)

// async function onRecvMsg (msg) {
//   const imgURIList = msg.imgURIList

//   if (imgURIList.length === 0) {
//     return
//   }

//   try {
//     const res = await filterImages(imgURIList)
//     if (res.status !== 200) {
//       console.error(`Failed to get response from API with status ${res.status}`)
//       return
//     }

//     const imgFilterRes = await res.json()
//     console.log(imgFilterRes.imgFilterResList)
//     for (const res of imgFilterRes.imgFilterResList) {
//       if (res.pass) {
//         const imgs = document.getElementsByTagName('img')
//         for (const img of imgs) {
//           if (img.src === res.imgURI) {
//             img.src = res.imgURI
//           }
//         }
//       }
//     }
//     // TODO: for each filter response
//     // if filter passes, update img src tag.
//   } catch (err) {
//     console.log(err)
//   }
// }
