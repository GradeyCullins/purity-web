import browser, { Tabs } from 'webextension-polyfill'

export const getCurrentTab = async (): Promise<Tabs.Tab> => {
  const queryOptions = { active: true, lastFocusedWindow: true }
  const [tab] = await browser.tabs.query(queryOptions)
  return tab
}
