import { sum, updateImgListSrc, defaultImgURI } from '../src/content'
import { JSDOM } from 'jsdom'

test('adds 1 and 2 to equal 3', () => {
  expect(sum(1, 2)).toBe(3)
})

test('adds -1 and 1 to equal 0', () => {
  expect(sum(-1, 1)).toBe(0)
})

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
