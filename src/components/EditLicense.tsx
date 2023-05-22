import React, { useEffect, useState } from 'react'
import Button from './Button'
import { getLicense } from '@src/api'
import { faCheckCircle, faXmarkCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

interface AddLicenseProps {
  license: string
  setLicense: React.Dispatch<React.SetStateAction<string>>
  onSaveLicense: (license: string) => void
}

const validateLicense = async (licenseID: string): Promise<boolean> => {
  const license = await getLicense(licenseID)
  if (license === undefined) {
    return false
  }
  return license?.isValid
}

const AddLicense: React.FC<AddLicenseProps> = (
  { license, setLicense, onSaveLicense }
): JSX.Element => {
  const [isValid, setIsValid] = useState<boolean | undefined>()

  useEffect(() => {
    validateLicense(license)
      .then(isValid => setIsValid(isValid))
      .catch(err => { console.error(err) })
  }, [])

  return (
    <div>
      <h1 className='text-2xl font-bold'>Your License</h1>
      <p className='mb-4'>Enter your Purity Vision license</p>
      <form onSubmit={e => {
        e.preventDefault()
        validateLicense(license)
          .then(isValid => {
            setIsValid(isValid)

            if (isValid) {
              onSaveLicense(license)
            }
          })
          .catch(err => { console.error(err) })
      }}
      >
        <label htmlFor='license-input' className='block'>License</label>
        <input
          type='text'
          name='license'
          id='license-input'
          className='px-4 py-2 rounded border mb-2 mr-2 w-3/4'
          value={license}
          onChange={(e) => { setLicense(e.target.value) }}
          pattern='^[{]?[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}[}]?$'
          required
        />
        {isValid === true
          ? <FontAwesomeIcon icon={faCheckCircle} className='text-green-400' />
          : <FontAwesomeIcon icon={faXmarkCircle} className='text-red-400' />}
        <Button
          className='block'
        >
          Save
        </Button>

      </form>
    </div>
  )
}

export default AddLicense
