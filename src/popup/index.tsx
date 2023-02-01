import * as React from 'react'
import * as ReactDOM from 'react-dom'
import browser from 'webextension-polyfill'
import '../css/app.css'
import 'react-tooltip/dist/react-tooltip.css'
import Popup from './Popup'

browser.tabs.query({ active: true, currentWindow: true }).then(() => {
  ReactDOM.render(<Popup />, document.getElementById('popup'))
}).catch(err => console.log(err))
