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