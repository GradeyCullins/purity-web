import { updateImgListSrc, defaultImgURI } from '../src/content'
import { JSDOM } from 'jsdom'

test('changes image tags src attribute and sets old-src attribute', async () => {
  const dom = await JSDOM.fromFile('test/fixtures/test.html', {})
  dom.serialize()
  const imgList = dom.window.document.querySelectorAll('img')
  const oldSrc = imgList.item(0).src
  updateImgListSrc(imgList, defaultImgURI)
  imgList.forEach(img => {
    expect(img.src).toBe(defaultImgURI)
    expect(img.getAttribute('old-src')).toBe(oldSrc)
  })
})
