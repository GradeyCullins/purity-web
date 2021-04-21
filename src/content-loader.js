/**
   Thanks to Github user otiai10 for the solution to adding es6 modules to content scripts.
   src: https://github.com/otiai10/chrome-extension-es6-import
*/
(async () => {
  const src = browser.extension.getURL('src/content.js')
  const contentScript = await import(src)
  contentScript.main(/* chrome: no need to pass it */)
})()
