const checkPendingOperations = systemInfo => {
  if (systemInfo.isNewOperationTriggered) {
    return true
  }

  const result = systemInfo.operations.some(operation => (
    ['queued', 'executing'].indexOf(operation.status) !== -1
  ))

  return result
}

const getIsUpdating = status => ['STARTING', 'STOPPING', 'RESTARTING'].includes(status)

const getMiningDisabledAttribute = statuses => getIsUpdating(statuses.MINER) || statuses.NODE !== 'RUNNING'

const getTorDisabledAttribute = (statuses, systemInfo) => (
  getIsUpdating(statuses.NODE)
  || getIsUpdating(statuses.TOR)
  || checkPendingOperations(systemInfo)
)

export {
  checkPendingOperations,
  getIsUpdating,
  getMiningDisabledAttribute,
  getTorDisabledAttribute,
}
