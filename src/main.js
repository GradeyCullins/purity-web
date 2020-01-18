// Stores user settings.
let settings = {}

// Latest clean user settings. Used to detect changes.
let settingsSnapshot = {}

// A flag used to toggle the save button.
// let settingsChanged = false

const settingsChanged = new Event('settingsChanged')

const saveBtn = document.getElementById('saveBtn')

// Load user settings using chrome.storage.local API.
chrome.storage.local.get(_settings => {
  settings = settingsSnapshot = _settings
  for (const domain of settings.domains) {
    cloneAndDeduplicate('domainList', 'domainRowTempl', domain)
  }
})

document.getElementById('addDomainBtn').addEventListener('click', onAddDomainRow)
saveBtn.addEventListener('click', onSaveSettings)
saveBtn.addEventListener('settingsChanged', onSettingsChanged)

async function onSaveSettings() {
  let inputs = document.getElementsByClassName('domainInput')
  let domains = []
  for (let i = 0; i < inputs.length; i++) {
    // Only add non-empty input values to the domain list.
    const val = inputs[i].value.trim()
    if (val) {
      domains.push(val)
    }
  }
  settings.domains = domains
  await chrome.storage.local.set(settings)
  console.log('Updated settings')
}

function onSettingsChanged() {
  console.log('settings changed')
  saveBtn.classList.remove('disabled')
}

function onAddDomainRow() {
  cloneAndDeduplicate('domainList', 'domainRowTempl', '')
}

function onInputChange() {
  // let inputs = document.getelementsbyclassname('domaininput')
  // let domains = []
  // for (let i = 0; i < inputs.length; i++) {
  //   // only add non-empty input values to the domain list.
  //   const val = inputs[i].value.trim()
  //   if (val) {
  //     domains.push(val)
  //   }
  // }
  // settings.domains = domains
  // await chrome.storage.local.set(settings)
  // console.log('updated settings')
}

function onDeleteDomainRow(ev) {
  let button
  // If the click target is the child <i> tag, choose the even target's parent
  // in order to select the button Node.
  if (ev.srcElement.localName === 'i') {
    button = ev.srcElement.parentNode
  } else {
    button = ev.target
  }

  // If the sibling input element being deleted has a valid URL, 
  // and is a saved domain in the user settings, emit a settingsChanged event.
  const val = button.parentNode.children[0].value.trim()
  if (val && settings.domains.includes(val)) {
    saveBtn.dispatchEvent(settingsChanged)
  }

  document.getElementById('domainList').removeChild(button.parentNode)
}

function cloneAndDeduplicate(parentID, cloneID, val) {
  const templEl = document.getElementById(cloneID)
  if (!templEl) {
    console.error(`Couldn\'t find element with id ${cloneID}`)
    return
  }
  const cloneEl = templEl.cloneNode(true)
  const cloneInput = cloneEl.children[0]
  cloneInput.addEventListener('change', onInputChange)

  // Fix attributes.
  cloneEl.style.display = 'flex'
  cloneInput.removeAttribute('id')
  cloneInput.value = val
  document.getElementById(parentID).append(cloneEl)

  // Add event listener for delete button of new rows.
  cloneEl.children[1].addEventListener('click', onDeleteDomainRow)
}
