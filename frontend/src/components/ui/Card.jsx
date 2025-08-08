import React from 'react'

const Card = ({ children, className = '', hover = true }) => {
  return (
    <div className={`
      dark-card rounded-xl adobe-shadow p-6 
      ${hover ? 'hover:dark-card-hover transform hover:scale-105' : ''} 
      transition-all duration-300 
      ${className}
    `}>
      {children}
    </div>
  )
}

export default Card
