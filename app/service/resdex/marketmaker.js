// @flow
import { OSService } from '../os-service'

/**
 * ES6 singleton
 */
let instance = null

const osService = new OSService()

/**
 * @export
 * @class MarketMakerService
 */
export class MarketMakerService {
	/**
	 * Creates an instance of MarketMakerService.
   *
	 * @memberof MarketMakerService
	 */
	constructor() {
    if (!instance) {
      instance = this
    }

		return instance
	}

	/**
   * Starts marketmaker
   *
	 * @memberof MarketMakerService
	 */
	start() {
    osService.execProcess('TOR')
	}

	/**
   * Stops marketmaker
   *
	 * @memberof MarketMakerService
	 */
	stop() {
    osService.killProcess('MARKET_MAKER')
	}
}

