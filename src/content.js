const purityAPIURL = 'http://localhost:8080'
const defaultImgURI = 'https://cdn.frankerfacez.com/emoticon/121482/4'
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
  const imgURIList = []
  const imgList = document.getElementsByTagName('img')

  imgURIList.push(...updateImgListSrc(imgList))
  if (imgURIList.length === 0) {
    return
  }

  try {
    const res = await filterImages(imgURIList)
    if (res.status !== 200) {
      console.error(`Failed to get response from API with status ${res.status}`)
      return
    }

    const imgFilterRes = await res.json()
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
    // TODO: for each filter response
    // if filter passes, update img src tag.
  } catch (err) {
    console.log(err)
  }
}

// async function filterBackgroundImage () {
// }

// function updateElBackgroundImg (el) {
//   if (!el.style.backgroundImage) {
//     return
//   }

//   el.style.backgroundImage = el.style.backgroundImage.split(', ').filter(val => {
//     return val.match('url')
//   }).map(val => defaultImgURI)
// }

// function getBackgroundImgList () {
//   const imgList = []

//   // List of tags that are likely to have a background-image CSS property.
//   const tags = ['div', 'section']
//   for (const tag of tags) {
//     document.querySelectorAll(tag).forEach(el => {
//       if (el.style.backgroundImage) {
//         const urls = el.style.backgroundImage.split(', ').filter(val => {
//           return val.match('url')
//         })
//         if (urls.length > 0) {
//           imgList.push(el)
//         }
//       }
//     })
//   }

//   return imgList
// }

function updateImgListSrc (imgList) {
  const imgURIList = []

  for (const img of imgList) {
    imgURIList.push(img.src)
    img.setAttribute('old-src', img.src)
    img.src = defaultImgURI
  }

  return imgURIList
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
