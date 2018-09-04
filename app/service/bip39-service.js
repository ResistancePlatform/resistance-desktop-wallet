// @flow

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
 * @class ResistanceService
 */
export class ResistanceService {
	/**
	 * Creates an instance of ResistanceService.
   *
	 * @memberof ResistanceService
	 */
	constructor() {
		if (!instance) { instance = this }

		return instance
	}

	/**
	 * Returns Resistance service data path.
   *
	 * @memberof ResistanceService
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
