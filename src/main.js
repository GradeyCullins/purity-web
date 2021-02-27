// Stores user settings.
let settings = {}

// Bottom row buttons.
const saveBtn = document.getElementById('saveBtn')
const addDomainBtn = document.getElementById('addDomainBtn')

// Load user settings using chrome.storage.local API.
chrome.storage.local.get(_settings => {
  settings = _settings
  if (!settings.domains) {
    settings = { domains: [] }
    return
  }
  for (const domain of settings.domains) {
    cloneAndDeduplicate('domainList', 'domainRowTempl', domain)
  }
})

addDomainBtn.addEventListener('click', onAddDomainRow)
saveBtn.addEventListener('click', onSaveSettings)

async function onSaveSettings () {
  const inputs = document.getElementsByClassName('domainInput')
  const domains = []
  for (let i = 0; i < inputs.length; i++) {
    // Only add non-empty input values to the domain list.
    const val = inputs[i].value.trim()
    if (val) {
      domains.push(val)
    }
  }
  settings.domains = domains
  await chrome.storage.local.set(settings)
  toggleSaveBtn(false)
  console.log('Updated settings')
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
