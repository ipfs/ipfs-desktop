import {shell} from 'electron'
import {apiAddrToUrl} from './utils'
import {logger} from '../config'

export default function openWebUI (ipfs, cb) {
  ipfs().config.get('Addresses.API')
    .then((res) => {
      shell.openExternal(apiAddrToUrl(res))
    })
    .catch(logger.error)
}
