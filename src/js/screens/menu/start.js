import React from 'react'
import {ipcRenderer} from 'electron'

import TextButton from '../../components/view/text-button'

function startDaemon () {
  ipcRenderer.send('start-daemon')
}

const styles = {
  wrapper: {
    display: 'flex',
    width: '100%',
    height: '100%',
    backgroundColor: '#252525',
    color: '#FFFFFF',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '0 20 20'
  },
  content: {
    display: 'flex',
    flex: '1',
    margin: '40px 0',
    flexDirection: 'column'
  },
  text: {
    padding: '40px 0',
    textAlign: 'center'
  }
}

export default function StartScreen () {
  return (
    <div style={styles.wrapper}>
      <div style={styles.content}>
        <img
          src='../img/offline-icon.png'
          width='64'
          height='64'
          style={{margin: '0 auto'}}
        />
        <div style={styles.text}>
          Oh snap, it looks like your node<br />
          is not running yet. Let’s change<br />
          that by clicking that button
        </div>
      </div>
      <TextButton text='Start Node' onClick={startDaemon} />
    </div>
  )
}
