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


    /**
     * @param {string} title
     * @param {string} message
     * @param {*} [option]
     * @memberof DialogService
     */
    showMessage(title: string, message: string, option?: any) {
        const showOption = option ? option : {
            type: 'info'
        }
        dialog.showMessageBox(Object.assign(showOption, { title, message }))
    }

}
