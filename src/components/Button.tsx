import React, { MouseEventHandler, ReactNode } from 'react'

interface IProps {
  children?: ReactNode
  disabled?: boolean
  onClick?: MouseEventHandler
  className?: string
}

const primaryStyles = 'text-blue-800 border-blue-800 hover:bg-blue-100 transition-colors'
const disabledStyles = 'disabled:border disabled:border-gray-400 disabled:text-gray-400'

const Button = ({ children, disabled = false, onClick, className }: IProps): JSX.Element => (
  <button
    onClick={onClick}
    className={`border px-4 h-8 py-1 ${className ?? ''} ${disabled ? disabledStyles : primaryStyles} `}
    disabled={disabled}
  >
    {children}
  </button>
)

export default Button
