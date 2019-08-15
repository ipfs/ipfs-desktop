import { EventEmitter } from 'events'

export default function mockElectron () {
  return {
    ipcMain: new EventEmitter()
  }
}
