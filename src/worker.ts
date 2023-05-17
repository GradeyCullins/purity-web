import browser from 'webextension-polyfill'
import { getCurrentTab } from './utils'

export interface ContentMessage {
  imgURLs: string[]
}

export interface AppStorage {
  licenseID: string
  filterEnabled: boolean
  needsRefresh: boolean
  domains: string[]
  tabs: {
    [tabID: number]: string[]
  }
}

browser.storage.local.set({
  filterEnabled: true,
  needsRefresh: false,
  domains: [],
  tabs: {}
})
  .catch(err => console.error(err))

browser.tabs.onUpdated.addListener((tabID, changeInfo, tab) => {
  browser.storage.local.get()
    .then(rawStorage => {
      updateBadge(tabID, rawStorage as AppStorage)
    })
    .catch(err => console.error('failed to fetch storage: ', err))
})

const updateBadge = (tabID: number, storage: AppStorage): void => {
  const tabState = storage.tabs[tabID]
  if (tabState !== undefined && storage.filterEnabled) {
    browser.action.setBadgeText({
      text: tabState.length.toString()
    }).catch(err => console.error(err))
    browser.action.setIcon({ path: '../logo.png' })
      .catch(err => console.error(err))
  } else {
    browser.action.setBadgeText({ text: '' })
      .catch(err => console.error(err))
    browser.action.setIcon({ path: '../logo-red.png' })
      .catch(err => console.error(err))
  }
}

browser.tabs.onActivated.addListener(info => {
  browser.storage.local.get()
    .then(rawStorage => {
      const storage = rawStorage as AppStorage
      updateBadge(info.tabId, storage)
    })
    .catch(err => { console.error('failed to get storage: ', err) })
})

browser.runtime.onMessage.addListener(async (req: ContentMessage) => {
  const tab = await getCurrentTab()
  if (tab?.id === undefined) {
    return
  }

  const storage = (await browser.storage.local.get()) as AppStorage
  storage.tabs[tab.id] = req.imgURLs

  updateBadge(tab.id, storage)

  console.log('setting storage: ', storage)
  browser.storage.local.set(storage)
    .catch(err => console.error('failed to set storage: ', err))

  // await browser.storage.local.set({ tabs: { [tab.id]: req.imgURLs } })

  // browser.action.setBadgeText({ text: req.imgURLs.length.toString() })
  //   .catch(err => console.error(err))
})

// Listen for messages sent from other parts of the extension
// browser.runtime.onMessage.addListener((request: { popupMounted: boolean }) => {
//   // Log statement if request.popupMounted is true
//   // NOTE: this request is sent in `popup/component.tsx`
//   if (request.popupMounted) {
//     console.log('backgroundPage notified that Popup.tsx has mounted.')
//   }
// })
