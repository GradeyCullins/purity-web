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

export async function filterImages (imgURIs: string[], license: string): Promise<Response | undefined> {
  const url = `${apiURL}/filter/batch`
  const opts = {
    method: 'post',
    body: JSON.stringify({ imgURIList: imgURIs }),
    headers: {
      licenseID: license
    }
  }

  try {
    return await fetch(url, opts)
  } catch (err) {
    console.error('failed to fetch: ', err)
  }
}

export async function health (): Promise<Response | undefined> {
  const url = `${apiURL}/health`
  try {
    return await fetch(url, {})
  } catch (err) {
    console.log('failed to fetch health: ', err)
  }
}

interface License {
  id: string
  email: string
  stripeID: string
  isValid: boolean
}

export async function getLicense (id: string): Promise<License | undefined> {
  const url = `${apiURL}/license/${id}`
  try {
    const res = await fetch(url, {})
    return await res.json() as License
  } catch (err) {
    console.error('failed to fetch license: ', err)
  }
}
