// @flow
import { createActions, handleActions } from 'redux-actions'
import { defaultAppState } from '../default-app-state'

export type AddressRow = {
	balance: number,
	confirmed: boolean,
	address: string
}

export type OwnAddressesState = {
	addresses?: AddressRow[],
	showDropdownMenu?: boolean
}

export const OwnAddressesActions = createActions(
  {
    EMPTY: undefined,

    GET_OWN_ADDRESSES: undefined,
    GET_OWN_ADDRESSES_SUCCESS: (addresses: AddressRow[]) => ({ addresses }),
    GET_OWN_ADDRESSES_FAIL: undefined,

    UPDATE_DROPDOWN_MENU_VISIBILITY: (show: boolean) => ({ show }),

    CREATE_NEW_ADDRESS: (isPrivate: boolean) => ({ isPrivate })
  },
  {
    prefix: 'APP/OWN_ADDRESSES'
  }
)

export const OwnAddressesReducer = handleActions(
  {
    [OwnAddressesActions.getOwnAddressesSuccess]: (state, action) => ({
      ...state, addresses: action.payload.addresses
    }),
    [OwnAddressesActions.getOwnAddressesFail]: state => ({
      ...state, addresses: []
    }),
    [OwnAddressesActions.updateDropdownMenuVisibility]: (state, action) => ({
      ...state, showDropdownMenu: action.payload.show
    })
  }, defaultAppState)
