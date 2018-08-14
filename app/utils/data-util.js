/**
 * @param {*} date 
 */
export const getFormattedDateString = (date: Date) => {
    const year = date.getFullYear().toString()
    const tempMonth = (date.getMonth() + 1).toString()
    const tempDay = date.getDate().toString()
    const month = tempMonth.length === 1 ? `0${tempMonth}` : tempMonth
    const day = tempDay.length === 1 ? `0${tempDay}` : tempDay

    const tempHours = date.getHours().toString()
    const tempMins = date.getMinutes().toString()
    const tempSecs = date.getSeconds().toString()
    const hours = tempHours.length === 1 ? `0${tempHours}` : tempHours
    const mins = tempMins.length === 1 ? `0${tempMins}` : tempMins
    const secs = tempSecs.length === 1 ? `0${tempSecs}` : tempSecs

    return `${year}/${month}/${day} ${hours}:${mins}:${secs}`
}

/**
 * @param {*} value 
 */
export const getTransactionDirection = (value: string) => {
    if (value === 'receive') return 'In'
    else if (value === 'send') return 'Out'
    else if (value === 'generate') return 'Mined'
    else if (value === 'immature') return 'Immature'

    return value
}

/**
 * @param {*} value 
 */
export const getTransactionConfirmed = (value: number) => (value !== 0 ? 'Yes' : 'No')

/**
 * @param {*} value 
 * @param {*} digits 
 */
export const getTransactionAmount = (value: number | string, digits?: number) => {
    const tempFloat = typeof value === 'string' ? parseFloat(value).toFixed(digits ? digits : 2) : value.toFixed(digits ? digits : 2)
    return tempFloat.startsWith('-') ? tempFloat.substring(1) : tempFloat
}

/**
 * @param {*} value 
 */
export const getTransactionDate = (value: number) => {
    const tempDate = new Date(value * 1000)
    return getFormattedDateString(tempDate)
}
