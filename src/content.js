const purityAPIURL = 'http://localhost:8080'

browser.runtime.onMessage.addListener(async msg => {
  const imgURIList = msg.imgURIList
  console.log(imgURIList)
  try {
    const res = await filterImages(imgURIList)
    console.log(res)
  } catch (err) {
    console.log(err)
  }
})

async function filterImages (imgURIList) {
  const url = `${purityAPIURL}/filter`
  const opts = {
    method: 'post',
    body: JSON.stringify({ imgURIList })
  }
  return window.fetch(url, opts)
}
