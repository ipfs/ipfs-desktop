import { logger } from '../utils'
import getContextMenu from './ctx-menu'

export default async () => {
  logger.info('Setting up context menu')
  return getContextMenu().add()
}
