// Wrapper function to make interfacing with the browser.storage API more "synchronous".
export const getLocalStorage = keys => {
  return browser.storage.local.get(keys)
}
