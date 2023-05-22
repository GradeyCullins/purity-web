import { faArrowsRotate, faEye, faEyeSlash, faSpinner, faTrashCan } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Button from '@src/components/Button'
import AddLicense from '@src/components/EditLicense'
import { getCurrentTab } from '@src/utils'
import { AppStorage } from '@src/worker'
import React, { ReactElement, ReactNode, useEffect, useState } from 'react'
import { Toaster, toast } from 'react-hot-toast'
import browser from 'webextension-polyfill'
// import difference from 'lodash/difference'
// import { Tooltip } from 'react-tooltip'

const Title = ({ children }: { children: ReactNode }): ReactElement =>
  <p className='text-lg mb-1 font-semibold'>{children}</p>

export interface DomainsStorage {
  domains: string[]
}

interface WrapperProps {
  children: ReactNode
}

const Wrapper = ({ children }: WrapperProps): JSX.Element => <div className='p-4 w-[42rem] text-[14px]'>{children}</div>

const Popup = (): JSX.Element => {
  const [domains, setDomains] = useState<string[]>([])
  const [imgs, setImgs] = useState<string[]>([])
  const [filterEnabled, setFilterEnabled] = useState(true)
  const [loading, setLoading] = useState(true)
  const [siteEnabled, setSiteEnabled] = useState(false)
  const [refreshVisible, setRefreshVisible] = useState(false)
  const [license, setLicense] = useState<string>('')
  const [licenseSaved, setLicenseSaved] = useState(false)
  const [editingLicense, setEditingLicense] = useState(false)

  useEffect(() => {
    const fetchAppStorage = async (): Promise<AppStorage | null> => {
      let storage: AppStorage

      try {
        storage = await browser.storage.local.get() as AppStorage
        console.log('loaded user storage: ', storage)
      } catch (err) {
        const msg = `failed to load local storage: ${(err as Error).message}`
        console.error(msg)
        return null
      } finally {
        setLoading(false)
      }
      return storage
    }

    const updateAppStorage = async (storage: AppStorage): Promise<void> => {
      setDomains(storage.domains)
      setFilterEnabled(storage.filterEnabled)

      if (storage.licenseID !== undefined && storage.licenseID !== '') {
        setLicenseSaved(true)
      }
      setLicense(storage.licenseID)

      try {
        const tab = await getCurrentTab()
        if (tab?.id === undefined || tab?.url === undefined) {
          throw new Error('Current tab was undefined')
        }
        const tabID = tab.id

        const currentHost = new URL(tab.url).host
        if (storage.domains.includes(currentHost)) {
          setSiteEnabled(true)
        }

        if (storage.tabs[tabID] !== undefined && storage.filterEnabled && storage.domains.includes(currentHost)) {
          setImgs(storage.tabs[tabID])
        }
      } catch (err) {

      }
    }

    const init = async (): Promise<void> => {
      const storage = await fetchAppStorage()
      if (storage !== null) {
        console.log('here')
        void updateAppStorage(storage)
      }
    }

    void init()
  }, [])

  if (loading) {
    return (
      <Wrapper>
        <FontAwesomeIcon icon={faSpinner} className='animate-spin text-2xl' />
      </Wrapper>
    )
  }

  if (!licenseSaved || editingLicense) {
    return (
      <Wrapper>
        <AddLicense
          license={license}
          setLicense={setLicense}
          onSaveLicense={license => {
            browser.storage.local.set({ licenseID: license })
              .then(() => {
                setLicenseSaved(true)
                setEditingLicense(false)
              })
              .catch(err => { console.error(err) })
          }}
        />
      </Wrapper>
    )
  }

  return (
    <Wrapper>
      <Toaster />
      <div className='flex items-center justify-between mb-4'>
        <Button
          className='flex text-lg gap-1 items-center cursor-pointer'
          onClick={() => {
            // TODO: can all this go into a function?
            const nextFilterState = !filterEnabled
            setFilterEnabled(nextFilterState)
            if (!nextFilterState) {
              setImgs([])
            }
            setRefreshVisible(true)
            browser.storage.local.set({ filterEnabled: nextFilterState })
              .catch(() => {})

            if (nextFilterState) {
              toast.success('filter enabled')
            } else {
              toast.error('filter disabled')
            }
          }}
        >
          <span className='font-bold select-none'>
            {filterEnabled ? 'ON' : 'OFF'}
          </span>

          <FontAwesomeIcon
            icon={filterEnabled ? faEyeSlash : faEye}
            className={filterEnabled ? 'text-blue-500' : 'text-red-500'}
          />
        </Button>
        <Button onClick={() => { setEditingLicense(true) }}>Edit License</Button>
      </div>

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
