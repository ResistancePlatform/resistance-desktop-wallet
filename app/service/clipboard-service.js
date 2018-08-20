// @flow
// import { clipboard } from 'electron'
const {clipboard} = require('electron')

/**
 * ES6 singleton
 */
let instance = null


/**
 * @export
 * @class ClipboardService
 */
export class ClipboardService {

	/**
	 * Creates an instance of ClipboardService.
	 * @memberof ClipboardService
	 */
	constructor() {
		if (!instance) { instance = this }

		return instance
	}

	/**
	 * We CANNOT use:
	 *   import { appStore } from '../state/store/configureStore'
	 *
	 * As that will import BEFORE the `appStore` be created !!!
	 * We have to require the latest `appStore` to make sure it has been created !!!
	 *
	 * @param {AppAction} action
	 * @memberof RpcService
	 */
	dispatchAction(action: AppAction) {
		const storeModule = require('../state/store/configureStore')
		if (storeModule && storeModule.appStore) {
			storeModule.appStore.dispatch(action)
		}
	}

	getContent(): any {
		return clipboard.readText()
	}

	setContent(content: any) {
		clipboard.writeText(content)
	}
}
