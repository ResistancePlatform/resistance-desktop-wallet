// @flow
import { AppAction } from '../appAction'

export type SendCashState = {
  isPrivateSendOn: fale,
  operationProgressPercent: number
}

const sendCashActionTypePrefix = 'SEND_CASH_ACTION'

export const SendCashActions = {
  EMPTY: `${sendCashActionTypePrefix}: EMPTY`,

  TOGGLE_PRIVATE_SEND: `${sendCashActionTypePrefix}: TOGGLE_PRIVATE_SEND`,

  togglePrivateSend: (): AppAction => ({ type: SendCashActions.TOGGLE_PRIVATE_SEND }),

  empty: (): AppAction => ({ type: SendCashActions.EMPTY })
}

const initState: SendCashState = {
  isPrivateSendOn: false,
  operationProgressPercent: 0.6
}

export const SendCashReducer = (state: SendCashState = initState, action: AppAction) => {

  switch (action.type) {
    case SendCashActions.TOGGLE_PRIVATE_SEND:
      return { ...state, isPrivateSendOn: !state.isPrivateSendOn }

    default:
      return state
  }
}