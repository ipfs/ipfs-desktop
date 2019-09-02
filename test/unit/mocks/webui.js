import sinon from 'sinon'

export default function mockWebUI () {
  return {
    webContents: {
      send: sinon.spy()
    }
  }
}
