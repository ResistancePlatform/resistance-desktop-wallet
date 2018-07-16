/**
 * Encapsulation of the colorful "console.log", usage:
 *
 * ```javascript
 *
 * logService.debug(enableDebug, this, `methodName`, `debug message here`, ConsoleTheme.testing, extraData)
 *
 * ```
 */

/**
 * ES6 singleton
 */
let instance = null

/**
 * 
 */
export const ConsoleTheme = {
    normal: '',
    testing: 'color: darkcyan; font-size: 0.7rem; font-style: italic',
    important: 'color: green; font-size: 0.7rem; font-style: normal; font-weight: bold',
    error: 'color: red; font-size: 0.7rem; font-style: normal; font-weight: bold'
}

/**
 * @export
 * @class LoggerService
 */
export class LoggerService {

    /**
     * Creates an instance of LoggerService.
     * @memberof LoggerService
     */
    constructor() {
        if (!instance) {
            instance = this
        }

        return instance
    }

    /**
     * @param {(Object | string)} objRef 
     * @param {string} methodName 
     * @param {string} msg 
     * @param {string} consoleTheme 
     * @param {*} [extraData] 
     * @memberof LoggerService
     */
    debug(objRef: Object | string, methodName: string, msg: string, displayFormat: string, extraData?: any) {

        const className = objRef instanceof Object ? objRef.constructor.name : objRef
        const messageToPrint = displayFormat ? `%c[${className} - ${methodName}] ${msg}` : `[${className} - ${methodName}] ${msg}`

        // // console.log(`className: ${className}, enableDebug: ${enableDebug}`)
        // if (!enableDebug) {
        //     return
        // }

        if (displayFormat) {
            if (extraData) {
                console.log(messageToPrint, displayFormat, extraData) // tslint:disable-line no-console
            } else {
                console.log(messageToPrint, displayFormat) // tslint:disable-line no-console
            }
        } else {
            if (extraData) {
                console.log(messageToPrint, extraData) // tslint:disable-line no-console
            } else {
                console.log(messageToPrint) // tslint:disable-line no-console
            }
        }
    }

}
