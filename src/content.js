const purityAPIURL = 'http://localhost:8080'
export const defaultImgURI = 'https://cdn.frankerfacez.com/emoticon/121482/4'
const onDocLoad = docLoadHandler

export function sum (a, b) {
  return a + b
}

export function main () {
  if (document.readyState === 'complete') {
    document.addEventListener('DOMContentLoaded', onDocLoad)
  } else {
    onDocLoad()
  }
}

async function docLoadHandler () {
  const domainList = (await browser.storage.local.get(null)).domains

  // Don't do image filtering if the current tab URL is not in the domain whitelist.
  if (!domainList.includes(window.location.hostname)) {
    return
  }

  // Async call to filter images as <img> tags.
  filterImgTags()

  // Async call to filter images as CSS - background-image: url.
  // filterBackgroundImage()
  // const imgList = getBackgroundImgList()
}

async function filterImgTags () {
  const imgList = document.getElementsByTagName('img')
  if (imgList.length === 0) {
    return
  }

  // Run all the images through the filter and temporarilily change their src attrs to be of the placeholder img URI to be safe.
  updateImgListSrc(imgList, defaultImgURI)

  const imgURIList = []
  for (const img of imgList) {
    imgURIList.push(img.getAttribute('old-src'))
  }

  try {
    const res = await filterImages(imgURIList)
    if (res.status !== 200) {
      console.error(`Failed to get response from API with status ${res.status}`)
      return
    }

    const imgFilterRes = await res.json()

    // TODO: rewrite to be more functional, less O^2.
    // Should use hash structures for faster mix-and-matching between JSON responses and img elements.
    for (const res of imgFilterRes) {
      if (res.pass) {
        for (const img of imgList) {
          const oldSrc = img.getAttribute('old-src')
          if (oldSrc === res.imgURI) {
            img.src = res.imgURI
          }
        }
      }
    }
  } catch (err) {
    console.log(err)
  }
}

// Warn: function has side-effects!
// Take list of img elements and change their image src attribute to be of value "src".
export function updateImgListSrc (imgList, src) {
  for (const img of imgList) {
    img.setAttribute('old-src', img.src)
    img.src = src
  }
}

async function filterImages (imgURIList) {
  const url = `${purityAPIURL}/filter`
  const opts = {
    method: 'post',
    body: JSON.stringify({ imgURIList })
  }
  return window.fetch(url, opts)
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
