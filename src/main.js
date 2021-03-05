// Stores user settings.
let settings = {}

// Bottom row buttons.
const saveBtn = document.getElementById('saveBtn')
const addDomainBtn = document.getElementById('addDomainBtn')
const addThisSiteBtn = document.getElementById('add-this-site-btn')

const main = async _settings => {
  console.log('Main called with user settings: ', _settings)
  settings = _settings
  addDomainBtn.addEventListener('click', onAddDomainRow)
  saveBtn.addEventListener('click', onSaveSettings)
  addThisSiteBtn.addEventListener('click', onAddThisSite)

  if (!settings.domains) {
    settings = { domains: [] }
    return
  }
  for (const domain of settings.domains) {
    cloneAndDeduplicate('domainList', 'domainRowTempl', domain)
  }
}

// Load user settings using chrome.storage.local API.
chrome.storage.local.get(_settings => {
  main(_settings)
})

function onAddThisSite () {
  chrome.tabs.query({ active: true }, tabs => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      function: () => {
        return window.location.hostname
      }
    }, res => {
      const domain = res[0].result
      cloneAndDeduplicate('domainList', 'domainRowTempl', domain)
      onSaveSettings()
    })
  })
}

async function onSaveSettings () {
  const inputs = document.getElementsByClassName('domainInput')
  const domainList = []

  for (let i = 0; i < inputs.length; i++) {
    // Only add non-empty input values to the domain list.
    let domainInput = inputs[i].value.trim()

    if (!domainInput) {
      continue
    }

    // If the domain input contains http/https, strip it.
    if (domainInput.indexOf('http://') !== -1) {
      domainInput = domainInput.substring(7, domainInput.length)
    }
    if (domainInput.indexOf('https://') !== -1) {
      domainInput = domainInput.substring(8, domainInput.length)
    }

    domainList.push(domainInput)
  }

  settings.domains = domainList
  chrome.storage.local.set(settings)
  toggleSaveBtn(false)
  console.log('Updated filter list')
}

function onAddDomainRow () {
  cloneAndDeduplicate('domainList', 'domainRowTempl', '')
}

function onInputChange (ev) {
  // Note: For some reason the expression: ev.target.classList.contains('valid'))
  // resolves to false unless it is executed after a short delay of a few seconds.
  //
  // If the changed input has a valid entry, allow the user to save.
  if (ev.target.matches(':valid')) {
    toggleSaveBtn(true)
  }
}

function onDeleteDomainRow (ev) {
  let button
  // If the click target is the child <i> tag, choose the even target's parent
  // in order to select the button Node.
  if (ev.srcElement.localName === 'i') {
    button = ev.srcElement.parentNode
  } else {
    button = ev.target
  }

  // Remove the HTML node.
  document.getElementById('domainList').removeChild(button.parentNode)

  // If the sibling input element being deleted has a non-empty value and is a
  // saved domain in the user settings, enable the user to save the changes.
  const val = button.parentNode.children[0].value.trim()
  if (val && settings.domains.includes(val)) {
    // Enable the save button when a user deletes a non-emptty domain rule.
    toggleSaveBtn(true)
  }
}

// Create DOM input nodes for each domain in the user settings and populate them with their
// respective domains.
function cloneAndDeduplicate (parentID, cloneID, val) {
  const templEl = document.getElementById(cloneID)
  if (!templEl) {
    console.error(`Couldn't find element with id ${cloneID}`)
    return
  }
  const cloneEl = templEl.cloneNode(true)
  const cloneInput = cloneEl.children[0]

  // Fix attributes.
  cloneEl.style.display = 'flex'
  cloneEl.removeAttribute('id')
  cloneInput.value = val
  document.getElementById(parentID).append(cloneEl)

  // Add the event listener after programatically changing the input value to avoid
  // erroneously firing the 'change' event.
  cloneInput.addEventListener('change', onInputChange, { capture: false })

  // Add event listener for delete button of new rows.
  cloneEl.children[1].addEventListener('click', onDeleteDomainRow)
}

// Enable or disable the save button based on the bool argument 'enable'.
function toggleSaveBtn (enable) {
  if (enable) {
    saveBtn.classList.remove('disabled')
  } else {
    saveBtn.classList.add('disabled')
  }
}
