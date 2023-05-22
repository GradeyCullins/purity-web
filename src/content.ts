import browser from 'webextension-polyfill'
import { filterImages, health } from './api'
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

const isPageEnabled = (
  { location, blacklist, whitelist }: { location: string, blacklist: string[], whitelist: string[] }
): boolean => {
  // TODO: add or switch to whitelist
  return !blacklist.includes(location)
}

const testDomains = ['boards.4chan.org', 'boards.4channel.org', 'test.gradeycullins.com']

export async function main (): Promise<void> {
  const storage = await browser.storage.local.get() as AppStorage

  if (!storage.filterEnabled) {
    return
  }

  const opts = {
    location: window.location.hostname,
    blacklist: storage.blacklist,
    whitelist: []
  }

  if (!isPageEnabled(opts)) {
    return
  }

  // Test code. REMOVE
  if (!testDomains.includes(window.location.hostname)) {
    return
  }

  // Don't do image filtering if the backend is not reachable.
  const res = await health()
  if (res === undefined) {
    console.log('something went wrong')
    return
  }

  if (res.status !== 200) {
    console.log(`Health endpoint failed with non-200 response: ${res.status}`)
    return
  }

  filterPage(storage.licenseID)
    .catch(err => console.error(err))
}

// TODO: get imgs from other sources like background-image
function getPageImages (): HTMLImageElement[] {
  return [].slice.call(document.getElementsByTagName('img'))
}

async function filterPage (licenseID: string): Promise<any> {
  console.log('running Purity filter')

  const pageImages = getPageImages()

  try {
    displayLoadingTab()
    await filterImgTags(pageImages, licenseID)
  } catch (err) {
    console.error(err)
  } finally {
    removeLoadingTab()
  }
}

async function filterImgTags (imgs: HTMLImageElement[], license: string): Promise<any> {
  if (imgs.length === 0) {
    return
  }

  // Preemptively blur/filter images to avoid showing explicit content before API filter request completes.
  imgs.forEach(i => i.classList.add('blurred-img'))

  const imgURIList = imgs.map(img => img.src)

  const res = await filterImages(imgURIList, license)
  if (res === undefined) {
    console.error('failed to fetch')
    return
  }
  if (res.status !== 200) {
    console.error(`Failed to get response from API with status ${res.status}`)
    return
  }
  const filterRes = await res.json() as ImgFilterRes[]

  await sendFilterMsg(filterRes, imgs)

  showCleanImgs(filterRes, imgs)
}

const sendFilterMsg = async (res: ImgFilterRes[], imgs: HTMLImageElement[]): Promise<void> => {
  const filteredOutRes = res.filter(r => !r.pass)
  console.log(filteredOutRes)
  const filteredImgURLs = imgs
    .filter(img => filteredOutRes.find(res => res.imgURI === img.src) !== undefined)
    .map(fi => fi.currentSrc)

  console.log('PURITY VISION is hiding these images: ')
  for (const url of filteredImgURLs) {
    console.log(url)
  }

  const msg: ContentMessage = {
    imgURLs: filteredImgURLs
  }

  try {
    await browser.runtime.sendMessage(msg)
  } catch (err) {
    console.error('failed to send filtered image message: ', err)
  }
}

const showCleanImgs = (res: ImgFilterRes[], imgs: HTMLImageElement[]): void => {
  const passed = res.filter(r => r.pass)
  imgs
    .filter(img => passed.find(res => res.imgURI === img.src) !== undefined)
    .forEach(i => { i.classList.remove('blurred-img') })
}

void main()

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
