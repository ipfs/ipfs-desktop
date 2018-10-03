import React from 'react'

export function cidStartAndEnd (value) {
  const chars = value.split('')
  if (chars.length <= 9) return value
  const start = chars.slice(0, 4).join('')
  const end = chars.slice(chars.length - 4).join('')
  return {
    value,
    start,
    end
  }
}

export function shortCid (value) {
  const { start, end } = cidStartAndEnd(value)
  return `${start}…${end}`
}

const Cid = ({ value, title, style, ...props }) => {
  style = Object.assign({}, {
    textDecoration: 'none'
  }, style)
  const { start, end } = cidStartAndEnd(value)
  return (
    <abbr title={title || value} style={style} {...props}>
      <span>{start}</span>
      <span className='o-20'>…</span>
      <span>{end}</span>
    </abbr>
  )
}

export default Cid
