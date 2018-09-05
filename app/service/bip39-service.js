// @flow
import * as bip39 from 'bip39'

/**
 * ES6 singleton
 */
let instance = null

export type Wallet = {
  +mnemonicSeed: string,
  +privateKey: string
}

/**
 * @export
 * @class Bip39Service
 */
export class Bip39Service {
	/**
	 * Creates an instance of Bip39Service.
   *
	 * @memberof Bip39Service
	 */
	constructor() {
		if (!instance) { instance = this }

		return instance
	}

	/**
	 * Returns Resistance service data path.
   *
	 * @memberof Bip39Service
	 */
  generateWallet(isTestnet: boolean): Wallet {
    const seed = bip39.generateMnemonic(256)

    return {
      mnemonicSeed: seed,
      privateKey: 'dummy'
    }
  }

  retrievePrivateKeyFromMnemonicSeed(seed: string): string {
    return 'dummy'
  }
}
