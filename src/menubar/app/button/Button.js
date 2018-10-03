import React from 'react'

const Button = ({ bg = 'bg-aqua', color = 'white', className = '', disabled, danger, minWidth = 140, children, style, ...props }) => {
  const bgClass = danger ? 'bg-red' : disabled ? 'bg-gray-muted' : bg
  const colorClass = danger ? 'white' : disabled ? 'light-gray' : color
  const cls = `Button transition-all sans-serif dib v-mid fw5 nowrap lh-copy bn br1 pa2 pointer focus-outline ${bgClass} ${colorClass} ${className}`
  return (
    <button className={cls} disabled={disabled} style={{ minWidth, ...style }} {...props}>
      {children}
    </button>
  )
}

export default Button
