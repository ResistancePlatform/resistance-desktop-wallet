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
    log.debug('Websocket initialized on endpoint', endpoint)
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

  log.debug('Handling websocket message', JSON.stringify(message))

  const { resDex } = getStore().getState()
  const { currencies } = resDex.accounts
  const { swapHistory } = resDex.orders
  const uuids = swapHistory.map(swap => swap.uuid)

  // Detect if the message is about our limit order
  const limitOrder = swapHistory.find(swap => !swap.isMarket && swap.isActive)

  let shouldUpdateSwapData = false

  if (uuids.includes(message.uuid)) {
    shouldUpdateSwapData = true

  } else if (limitOrder) {
    const smartAddress = symbol => (
      symbol in currencies.RESDEX ? currencies.RESDEX[symbol].address : ''
    )

    if (
      message.iambob
      || message.address === smartAddress(message.base)
      || message.destaddr === smartAddress(message.rel)
    ) {
      message.uuid = limitOrder.uuid
      shouldUpdateSwapData = true
    }

  }

  if (shouldUpdateSwapData) {
    log.debug(`Updating swap data`)
    swapDB.updateSwapData(message)
  }

  this.ee.emit('message', message)
}

export default MarketmakerSocket
