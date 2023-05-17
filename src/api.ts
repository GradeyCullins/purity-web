declare const MODE: 'dev' | 'prod'
declare const API_URL: string

let apiURL: string

switch (MODE) {
  case 'dev':
    apiURL = 'http://localhost:8080'
    break
  case 'prod':
    apiURL = API_URL
    break
  default:
    apiURL = 'http://localhost:8080'
}

export async function filterImages (imgURIs: string[]): Promise<Response> {
  const url = `${apiURL}/filter/batch`
  const opts = {
    method: 'post',
    body: JSON.stringify({ imgURIList: imgURIs })
  }
  return await fetch(url, opts)
}

export async function health (): Promise<Response> {
  const url = `${apiURL}/health`
  return await fetch(url, {})
}
