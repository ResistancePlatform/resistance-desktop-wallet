// @flow

const { dialog } = require('electron').remote

/**
 * ES6 singleton
 */
let instance = null

/**
 * @export
 * @class DialogService
 */
export class DialogService {

    /**
     *Creates an instance of DialogService.
     * @memberof DialogService
     */
    constructor() {
        if (!instance) {
            instance = this
        }

        return instance
    }


    /**
     * @param {string} title
     * @param {string} errorMsg
     * @memberof DialogService
     */
    showError(title: string, errorMsg: string) {
        dialog.showErrorBox(`Error`, errorMsg)
    }

}