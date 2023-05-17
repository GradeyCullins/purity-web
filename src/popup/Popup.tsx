import { faPlus, faEye, faEyeSlash, faTrashCan, faSpinner, faArrowsRotate } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { AppStorage } from '@src/worker'
import Button from '@src/components/Button'
import { getCurrentTab } from '@src/utils'
import React, { ReactElement, ReactNode, useEffect, useState } from 'react'
import { toast, Toaster } from 'react-hot-toast'
import browser from 'webextension-polyfill'
// import difference from 'lodash/difference'
// import { Tooltip } from 'react-tooltip'

const Title = ({ children }: { children: ReactNode }): ReactElement =>
  <p className='text-lg mb-1 font-semibold'>{children}</p>

export interface DomainsStorage {
  domains: string[]
}

const AddLicense = (): JSX.Element => {
  return (
    <div>
      <label htmlFor='license-input'>License</label>
      <input type='text' name='license' id='license-input' />
    </div>
  )
}

interface WrapperProps {
  children: ReactNode
}

const Wrapper = ({ children }: WrapperProps): JSX.Element => <div className='p-4 w-[42rem] text-[14px]'>{children}</div>

const Popup = (): JSX.Element => {
  const [domains, setDomains] = useState<string[]>([])
  // const [newDomain, setNewDomain] = useState('')
  const [imgs, setImgs] = useState<string[]>([])
  const [filterEnabled, setFilterEnabled] = useState(false)
  const [loadingDomains, setLoadingDomains] = useState(true)
  const [siteEnabled, setSiteEnabled] = useState(false)
  const [refreshVisible, setRefreshVisible] = useState(false)
  // const [isSaveEnabled, setIsSaveEnabled] = useState(false)
  // let snapshotDomains: string[] = []

  // Load page's filtered images.
  // Load filtered domains.
  useEffect(() => {
    let tabID = -1

    const fetchStorage = async (): Promise<void> => {
      let storage: AppStorage

      try {
        storage = await browser.storage.local.get() as AppStorage
        console.log('loaded user storage: ', storage)
      } catch (err) {
        const msg = `failed to load local storage: ${(err as Error).message}`
        console.error(msg)
        throw new Error(msg)
      } finally {
        setLoadingDomains(false)
      }

      setDomains(storage.domains)
      setFilterEnabled(storage.filterEnabled)
      // setSnapshotDomains(domainsRes.domains)

      const tab = await getCurrentTab()
      if (tab?.id === undefined || tab?.url === undefined) {
        throw new Error('Current tab was undefined')
      }
      tabID = tab.id

      const currentHost = new URL(tab.url).host
      if (storage.domains.includes(currentHost)) {
        setSiteEnabled(true)
      }

      if (storage.tabs[tabID] !== undefined && storage.filterEnabled && storage.domains.includes(currentHost)) {
        setImgs(storage.tabs[tabID])
      }
    }

    fetchStorage()
      .catch(err => console.log(err))
  }, [])

  // useEffect(() => findDifference(), [domains])

  // TODO: Load filter settings.
  // useEffect(...)

  // const findDifference = (): void => {
  //   console.log(domains, snapshotDomains)
  //   const diff = difference(domains, snapshotDomains)
  //   console.log(diff)
  //   if (diff.length > 0) {
  //     setIsSaveEnabled(true)
  //   } else {
  //     setIsSaveEnabled(false)
  //   }
  // }

  // const handleSave = (): void => {
  //   browser.storage.local.set({ domains })
  //     .then(() => {
  //       // setSnapshotDomains(domains)
  //       // snapshotDomains = [...domains]
  //       toast.success('Filtered sites were updated')
  //     })
  //     .catch(err => console.error('failed to update domains in local storage: ', err))
  // }

  // const handleAddDomain = (): void => {
  //   if (newDomain === '') {
  //     toast.error('Input cannot be empty')
  //     return
  //   }
  //   setDomains([...domains].concat([newDomain]))
  //   toast.success(`Added ${newDomain}`)
  //   setNewDomain('')
  // }

  const handleAddCurrentSite = (): void => {
    getCurrentTab().then(tab => {
      if (tab.url === undefined) {
        toast.error('Active tab not found')
        return
      }

      const host = new URL(tab.url).host
      if (domains.includes(host)) {
        toast.error('This site is already added')
        return
      }

      const updatedDomains = domains.concat([host])
      setDomains(updatedDomains)
      setSiteEnabled(true)
      setFilterEnabled(true)
      setRefreshVisible(true)
      browser.storage.local.set({ domains: updatedDomains })
        .then(() => toast.success('Site was added'))
        .catch(err => console.error('failed to update domains in local storage: ', err))
    }).catch(err => console.error(err))
  }

  if (loadingDomains) {
    return (
      <div className='p-4 w-[42rem] text-[14px] text-center'>
        <FontAwesomeIcon icon={faSpinner} className='animate-spin text-2xl' />
      </div>
    )
  }

  return (
    <Wrapper>
      <Toaster />
      <div className='flex items-center justify-between mb-4'>
        <div className='flex gap-2'>
          <Button
            className='mb-2 uppercase'
            onClick={handleAddCurrentSite}
            disabled={siteEnabled}
          >
            <div className='flex items-center gap-2'>
              <FontAwesomeIcon icon={faPlus} />
              Add this site
            </div>
          </Button>
          {/* <Button
            className='uppercase border'
            onClick={() => {
              const nextFilterState = !filterEnabled
              setFilterEnabled(nextFilterState)
              if (!nextFilterState) {
                setImgs([])
              }
              setRefreshVisible(true)
              browser.storage.local.set({ filterEnabled: nextFilterState })
                .catch(() => {})
              toast.success(`Toggle ${filterEnabled ? 'enabled' : 'disabled'}`)
            }}
            disabled={!siteEnabled}
          >
            Toggle Filter
          </Button> */}
        </div>
        <button
          className={`
          flex text-lg gap-1 items-center cursor-pointer
          ${filterEnabled
            ? 'hover:bg-blue-100 border-blue-400 text-blue-500'
            : 'hover:bg-red-100 border-red-400 text-red-500'
          }
          transition-colors px-4 py-2 border
          `}
          onClick={() => {
            if (!siteEnabled) {
              toast('Please add this site first')
              return
            }
            const nextFilterState = !filterEnabled
            setFilterEnabled(nextFilterState)
            if (!nextFilterState) {
              setImgs([])
            }
            setRefreshVisible(true)
            browser.storage.local.set({ filterEnabled: nextFilterState })
              .catch(() => {})
            toast.success(`Toggle ${filterEnabled ? 'enabled' : 'disabled'}`)
          }}
        >
          <span className='font-bold select-none'>
            {filterEnabled ? 'ON' : 'OFF'}
          </span>

          <FontAwesomeIcon
            icon={filterEnabled ? faEyeSlash : faEye}
            className={filterEnabled ? 'text-blue-500' : 'text-red-500'}
          />
        </button>
      </div>

      {/* Add a site */}
      {/* <section className='mb-4'>
        <Title>Add a site</Title>
        <div className='flex items-center gap-2 mb-2'>
          <input
            type='text'
            value={newDomain}
            onChange={e => setNewDomain(e.target.value)}
            placeholder='e.g. https://facebook.com'
            className='w-3/4 border p-2 focus:border-blue-800 outline-none'
          />
          <Button
            className='border border-blue-500 text-blue-500 hover:bg-blue-100 transition-colors uppercase'
            onClick={handleAddDomain}
          >
            <div className='flex items-center gap-2'>
              <FontAwesomeIcon icon={faPlus} />
              add
            </div>
          </Button>

        </div>
      </section> */}

      {/* My filtered sites. */}
      <section className='mb-4'>
        <Title>
          Enabled Sites
        </Title>
        <div className='max-h-36 overflow-y-auto'>
          {domains.length === 0
            ? <p className='italic text-gray-600'>No websites are being filtered</p>
            : domains.map((dom, i) =>
              <div key={i} className='flex items-center gap-2 mb-1'>
                <FontAwesomeIcon
                  id='helpIcon'
                  icon={faTrashCan}
                  className='text-xl text-gray-400 cursor-pointer hover:text-red-400 transition-colors'
                  onClick={() => {
                    const copyArr = [...domains]
                    copyArr.splice(i, 1)
                    setDomains(copyArr)
                    browser.storage.local.set({ domains: copyArr })
                      .then(() => {
                        toast.success('Site was removed')
                        setSiteEnabled(false)
                      })
                      .catch(err => console.error('failed to update domains in local storage: ', err))
                  }}
                />
                <p className='text-gray-600 select-none'>
                  {dom}
                </p>
              </div>
            )}
        </div>
      </section>

      {/* Filtered images */}
      <section id='blocked-images-container'>
        <Title>Filtered Images</Title>
        {imgs.length === 0
          ? <p className='italic text-gray-600'>No images being filtered</p>
          : imgs.map((img, i) =>
            <p key={i}>{img}</p>
          )}
      </section>

      {/* Button row */}
      <section className='flex justify-end'>
        {refreshVisible &&
          <button
            className='flex gap-2 items-center text-red-500 cursor-pointer border border-red-400 px-4 py-2 hover:bg-red-100 transition-colors'
            onClick={() => {
              window.close()
              browser.tabs.reload()
                .then(() => setRefreshVisible(false))
                .catch(err => console.error(err))
            }}
          >
            <span>Refresh To Apply Changes</span>
            <FontAwesomeIcon
              icon={faArrowsRotate}
              className='text-2xl'
            />

          </button>}
      </section>
    </Wrapper>
  )
}

export default Popup
