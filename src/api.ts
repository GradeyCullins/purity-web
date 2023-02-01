const purityAPIURL = 'http://localhost:8080'

export async function filterImages (imgURIs: string[]): Promise<Response> {
  const url = `${purityAPIURL}/filter/batch`
  const opts = {
    method: 'post',
    body: JSON.stringify({ imgURIList: imgURIs })
  }
  return await fetch(url, opts)
}

export async function health (): Promise<Response> {
  const url = `${purityAPIURL}/health`
  return await fetch(url, {})
}
