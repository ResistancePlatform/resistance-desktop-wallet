// @flow
import { createActions } from 'redux-actions'
import { defaultAppState } from '../default-app-state'

type AppActionType = string

export type RpcPollingState = {
  registeredActions: [AppActionType, AppActionType, AppActionType][],
  actionsResponseReceived: { [AppActionType]: boolean }
}

export const RpcPollingActions = createActions(
  {
    EMPTY: undefined,
    REGISTER_ACTIONS: (polling, success, failure) => ({ polling, success, failure }),
    UNREGISTER_ACTIONS: (polling) => ({ polling }),
  },
  {
    prefix: 'APP/RPC_POLLING'
  }
)

export const RpcPollingReducer = (state: RpcPollingState = defaultAppState.rpcPolling, action: AppAction) => {
  let actionRow
  const payload = action.payload

  switch(action.type) {
    case RpcPollingActions.registerActions.toString():
      return {
        ...state,
        registeredActions: state.registeredActions.concat([[payload.polling, payload.success, payload.failure]])
      }
    case RpcPollingActions.unregisterActions.toString():
      return {
        ...state,
        registeredActions: state.registeredActions.filter(row => row[0] !== payload.polling)
      }
    default:
      actionRow = state.registeredActions.filter(row => row.indexOf(action.type) !== -1).pop()

      if (actionRow) {
        return {
          ...state,
          actionsResponseReceived: { ...state.actionsResponseReceived, [actionRow[0]]: action.type !== actionRow[0]}
        }
      }
  }

  return state
}
