// @flow
import { AppAction } from '../appAction'

export type AddressRow = {
  balance: number,
  confirmed: boolean,
  address: string
}

export type OwnAddressesState = {
  addresses?: AddressRow[]
}

const ownAddressesActionTypePrefix = 'OWN_ADDRESSES_ACTION'

export const OwnAddressesActions = {
  EMPTY: `${ownAddressesActionTypePrefix}: EMPTY`,

  GET_OWN_ADDRESSES: `${ownAddressesActionTypePrefix}: GET_OWN_ADDRESSES`,
  GET_OWN_ADDRESSES_SUCCESS: `${ownAddressesActionTypePrefix}: GET_OWN_ADDRESSES_SUCCESS`,
  GET_OWN_ADDRESSES_FAIL: `${ownAddressesActionTypePrefix}: GET_OWN_ADDRESSES_FAIL`,

  getOwnAddresses: (): AppAction => ({ type: OwnAddressesActions.GET_OWN_ADDRESSES }),
  getOwnAddressesSuccess: (addresses: AddressRow[]): AppAction => ({ type: OwnAddressesActions.GET_OWN_ADDRESSES_SUCCESS, payload: addresses }),
  getOwnAddressesFail: (): AppAction => ({ type: OwnAddressesActions.GET_OWN_ADDRESSES_FAIL }),

  empty: (): AppAction => ({ type: OwnAddressesActions.EMPTY })
}

const initState: OwnAddressesState = {
  addresses: []
}

export const OwnAddressesReducer = (state: OwnAddressesState = initState, action: AppAction) => {

  switch (action.type) {
    case OwnAddressesActions.GET_OWN_ADDRESSES_SUCCESS:
      return { ...state, addresses: action.payload }

    case OwnAddressesActions.GET_OWN_ADDRESSES_FAIL:
      return { ...state, addresses: [] }

    default:
      return state
  }
}