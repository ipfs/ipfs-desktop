import React from 'react'
import { render } from 'react-dom'
import NavBar from './navbar/NavBar'

class Menubar extends React.Component {
  render () {
    return (
      <div>
        <h1>IPFS Desktop</h1>

        <NavBar />
      </div>
    )
  }
}

// TODO: register screenshot hook

document.addEventListener('DOMContentLoaded', () => {
  render(<Menubar />, document.getElementById('root'))
})
