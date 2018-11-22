import log from 'electron-log'
import Emittery from 'emittery'
import pEvent from 'p-event'
import readBlob from 'read-blob'

import { getStore } from '~/store/configureStore'
import { SwapDBService } from '~/service/resdex/swap-db'


const swapDB = new SwapDBService()


class MarketmakerSocket {
	constructor(endpoint) {
		this.ws = new WebSocket(endpoint, ['pair.sp.nanomsg.org'])
		this.connected = pEvent(this.ws, 'open')

		const ee = new Emittery()
		this.ee = ee
		this.on = ee.on.bind(ee)
		this.off = ee.off.bind(ee)
		this.once = ee.once.bind(ee)

		this.ws.addEventListener('message', this::handleMessage)
    log.debug('Websocket initialized')
	}

	getResponse = queueId => this.ee.once(`id_${queueId}`)
}

async function handleMessage(event) {
  const json = await readBlob.text(event.data)
  const data = JSON.parse(json)
  const queueId = data.queueid
  const message = data.result

  if (queueId > 0) {
    this.ee.emit(`id_${queueId}`, message)
  }

  log.debug('Handling websocket message', queueId)

  const uuids = getStore().getState().resDex.orders.swapHistory.map(swap => swap.uuid)

  if (uuids.includes(message.uuid)) {
    log.debug(`Updating swap data`)
    swapDB.updateSwapData(message)
  }

  this.ee.emit('message', message)
}

export default MarketmakerSocket
