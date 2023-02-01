import { filterImages, health } from './api'
import browser from 'webextension-polyfill'
import { DomainsStorage } from './popup/Popup'
import { AppStorage, ContentMessage } from './worker'

interface ImgFilterRes {
  imgURI: string
  error: Error
  pass: boolean
  reason: string
}

const loadingTab = document.createElement('div')
const body = document.querySelector('body')

// document.addEventListener('readystatechange', (event) => {
//   if (document.readyState === 'complete') {
//   }
// })

const displayLoadingTab = (): void => {
  loadingTab.id = 'loading-tab'
  const loadingSpinner = document.createElement('div')
  loadingSpinner.classList.add('lds-dual-ring')

  const loadingText = document.createElement('p')
  loadingText.innerText = 'Purity Vision Running...'

  loadingTab.appendChild(loadingSpinner)
  loadingTab.appendChild(loadingText)
  body?.appendChild(loadingTab)
  // docLoadHandler()
  //   .catch(err => console.error('Failed to run content script main function: ', err))
}

const removeLoadingTab = (): void => {
  body?.removeChild(loadingTab)
}

export function main (): void {
  filterPage()
    .catch(err => console.error(err))
}

async function filterPage (): Promise<any> {
  const storage = await browser.storage.local.get() as AppStorage

  // Don't do image filtering if the current tab URL is not in the domain whitelist.
  if (!storage.domains.includes(window.location.hostname)) {
    console.log('webpage is not in user settings, skipping filter')
    return
  }

  if (!storage.filterEnabled) {
    console.log('filter is disabled in popup')
    return
  }

  displayLoadingTab()

  console.log('running Purity filter')

  // Don't do image filtering if the backend is not reachable.
  const res = await health()
  if (res.status !== 200) {
    console.log(`failed to reach backend with response code: ${res.status}`)
    return
  }

  // TODO: get imgs from other sources like background-image
  // const imgList = [...document.getElementsByTagName('img')]
  const imgList = [].slice.call(document.getElementsByTagName('img'))

  // Async call to filter images as <img> tags.
  filterImgTags(imgList)
    .catch(err => console.error(err))
}

async function filterImgTags (imgs: HTMLImageElement[]): Promise<any> {
  if (imgs.length === 0) {
    return
  }

  // Preemptively blur/filter images to avoid showing explicit content before API filter request completes.
  imgs.forEach(i => i.classList.add('blurred-img'))

  const imgURIList = imgs.map(img => img.src)
  // const imgURIList = []
  // for (const img of imgList) {
  //   imgURIList.push(img.src)
  // }

  try {
    const res = await filterImages(imgURIList)
    if (res.status !== 200) {
      console.error(`Failed to get response from API with status ${res.status}`)
      return
    }
    const filterRes = await res.json() as ImgFilterRes[]

    const filteredOutRes = filterRes.filter(res => !res.pass)
    const filteredImgURLs = imgs
      .filter(img => filteredOutRes.find(res => res.imgURI === img.src) !== undefined)
      .map(fi => fi.currentSrc)

    const msg: ContentMessage = {
      imgURLs: filteredImgURLs
    }

    await browser.runtime.sendMessage(msg)

    const passed = filterRes.filter(res => res.pass)
    imgs
      .filter(img => passed.find(res => res.imgURI === img.src) !== undefined)
      .forEach(i => { i.classList.remove('blurred-img') })
  } catch (err) {
    console.log(err)
  } finally {
    removeLoadingTab()
  }
}

// Warning: function has side-effects!
// Take an img element and add/modify markup to mark the image as explicit.
// export function updateFilteredImgMarkup (img: HTMLImageElement) {
//   if (!img) {
//     console.log('here')
//     return
//   }

//   const parent = img.parentElement

//   // Add a warning tag to the filtered image.
//   const warningNode = document.createElement('p')
//   warningNode.classList.add('warning-tag')
//   warningNode.innerHTML = `
// ⚠️ Google Vision Detected <span class="fail-reason-text">${img.getAttribute('reason')}</span> content in this image`
//   addElWarnTag(img, warningNode, parent)

//   // Add a container element to the image to make the filter more obvious.
//   const wrapper = document.createElement('div')
//   wrapper.classList.add('blurred-img-wrapper')
//   wrapEl(img, wrapper, parent)
// }

// function wrapEl (el, wrapper, parent) {
//   if (!el || !wrapper || !parent) {
//     return
//   }
//   wrapper.setAttribute('style', `width: ${el.width}; height: ${el.height}`)
//   parent.replaceChild(wrapper, el)
//   wrapper.appendChild(el)
// }

// function addElWarnTag (el, warnNode, parent) {
//   if (!el || !warnNode || !parent) {
//     return
//   }
//   // TODO: get the image URL from: src attribute, background-url, etc.
//   parent.insertBefore(warnNode, el)
//   const button = document.getElementById(el.src)
//   button.addEventListener('click', () => el.classList.toggle('blurred-img'))
// }

// chrome.runtime.onMessage.addListener(onRecvMsg)

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

main()
