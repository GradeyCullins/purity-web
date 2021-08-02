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

/**
 * Entry point for the content script after page is loaded.
 */
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
  await filterImgTags(imgList)

  // Add mutation observer to filter newly added images
  const bodyNode = document.querySelector('body')
  const config = { attributes: true, childList: true, subtree: true }
  const observer = new MutationObserver(mutationsList => {
    // Filter new images added to the DOM.
    mutationsList.filter(mut => {
      return mut.addedNodes.length > 0
    }).forEach(mut => {
      filterImgTags([...mut.addedNodes].filter(n => n.src))
    })

    // Remove warning tags from images removed from the DOM.
    let tieIn = ''
    mutationsList.filter(mut => {
      return mut.removedNodes.length > 0
    }).forEach(mut => {
      [...mut.removedNodes].filter(n => {
        tieIn = n.getAttribute('pv-tie-in')
        return tieIn && n.nodeName !== 'P'
      }).forEach(n => {
        const warnNode = document.querySelector(`[pv-tie-in="${tieIn}"]`)
        if (!warnNode) {
          console.log(`No filter warning tag was found for element ${n}`)
          return
        }
        warnNode.remove()
      })
    })
  })

  observer.observe(bodyNode, config)
}

/**
 * Loop over imgList and apply filters to images that are marked as explicit.
 * @param {HTMLElement[]} imgList - list of HTMLElement types to check for explicit content.
 */
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
      img.setAttribute('pv-reason', filterRes.reason) // Attach metadata to the HTML node for more detailed feedback in the UI.
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
/**
 * Apply a blur filter to the img parameter and add a warning tag to notify users that the image was filtered.
 * @param {HTMLElement} img - the img to filter
 */
export function updateFilteredImgMarkup (img) {
  if (!img) {
    return
  }

  const parent = img.parentElement

  // Blur the image.
  img.classList.add('blurred-img')

  // Add a warning tag to the blurred image.
  const warningNode = document.createElement('p')
  warningNode.classList.add('warning-tag')
  warningNode.innerHTML = `
⚠️ Google Vision Detected <span class="fail-reason-text">${img.getAttribute('pv-reason')}</span> content in this image`
  addElWarnTag(img, warningNode, parent, img.src)

  // const button = document.getElementById(el.src)
  // button.addEventListener('click', () => el.classList.toggle('blurred-img'))

  // Add a container element to the image to make the filter more obvious.
  // const wrapper = document.createElement('div')
  // wrapper.classList.add('blurred-img-wrapper')
  // wrapEl(img, wrapper, parent)
}

// function wrapEl (el, wrapper, parent) {
//   if (!el || !wrapper || !parent) {
//     return
//   }
//   wrapper.setAttribute('style', `width: ${el.width}; height: ${el.height}`)
//   parent.replaceChild(wrapper, el)
//   wrapper.appendChild(el)
// }

/**
 * add a warning tag above an element that the element contains explicit content
 * @param {HTMLElement} el - the element to add the warning tag to
 * @param {HTMLElement} warnNode - the warning tag element
 * @param {HTMLElement} parent - the parent element of el
 * @param {string} [tieIn] - optional string that relates the el to the warning tag for later association
 */
function addElWarnTag (el, warnNode, parent, tieIn) {
  if (!el || !warnNode || !parent) {
    return
  }

  if (tieIn) {
    el.setAttribute('pv-tie-in', tieIn)
    warnNode.setAttribute('pv-tie-in', tieIn)
  }
  // TODO: get the image URL from: src attribute, background-url, etc.
  parent.insertBefore(warnNode, el)
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
