import React from 'react'

const Loader = () => {
  return (
    <div className="flex items-center justify-center space-x-2">
      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
      <span>Processing...</span>
    </div>
  )
}

export default Loader
