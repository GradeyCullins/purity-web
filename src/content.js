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
  // Preemptively blur/filter images to avoid showing explicit content before API filter request completes.
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
      updateFilteredImgMarkup(img)
    }
  } catch (err) {
    console.log(err)
  }
}

// Warning: function has side-effects!
// Take an img element and add/modify markup to mark the image as explicit.
export function updateFilteredImgMarkup (img) {
  if (!img) {
    return
  }

  const parent = img.parentElement

  // Add a warning tag to the filtered image.
  const warningNode = document.createElement('p')
  warningNode.classList.add('warning-tag')
  warningNode.innerHTML = `
⚠️ Google Vision Detected <span class="fail-reason-text">${img.getAttribute('reason')}</span> content in this image <button id='${img.src}'>show</button>`
  addElWarnTag(img, warningNode, parent)

  // Add a container element to the image to make the filter more obvious.
  const wrapper = document.createElement('div')
  wrapper.classList.add('blurred-img-wrapper')
  wrapEl(img, wrapper, parent)
}

function wrapEl (el, wrapper, parent) {
  if (!el || !wrapper || !parent) {
    return
  }
  wrapper.setAttribute('style', `width: ${el.width}; height: ${el.height}`)
  parent.replaceChild(wrapper, el)
  wrapper.appendChild(el)
}

function addElWarnTag (el, warnNode, parent) {
  if (!el || !warnNode || !parent) {
    return
  }
  // TODO: get the image URL from: src attribute, background-url, etc.
  parent.insertBefore(warnNode, el)
  el.classList.add('blurred-img')
  const button = document.getElementById(el.src)
  button.addEventListener('click', () => el.classList.toggle('blurred-img'))
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
