const purityAPIURL = 'http://localhost:8080'

export async function filterImages (imgURIList) {
  const url = `${purityAPIURL}/filter`
  const opts = {
    method: 'post',
    body: JSON.stringify({ imgURIList })
  }
  return window.fetch(url, opts)
}

export async function health () {
  const url = `${purityAPIURL}/health`
  return window.fetch(url, {})
}
