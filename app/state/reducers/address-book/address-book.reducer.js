// @flow
import { createActions, handleActions } from 'redux-actions'
import { defaultAppState } from '../default-app-state'

export type AddressBookRow = {
  name: string,
  address: string
}

export type AddressBookState = {
  addresses?: AddressBookRow[],
  newAddressDialog: {
    isVisible: boolean,
    isInEditMode?: boolean,
    name?: string,
    address?: string
  }
}

export const AddressBookActions = createActions(
  {
    EMPTY: undefined,

    LOAD_ADDRESS_BOOK: undefined,

    EDIT_ADDRESS: (address: AddressRow) => ({ address }),
    COPY_ADDRESS: (address: AddressRow) => ({ address }),
    REMOVE_ADDRESS: (address: AddressRow) => ({ address }),

    NEW_ADDRESS_DIALOG: {
      SHOW: (addressRecord: AddressBookRow | undefined) => ({ addressRecord }),
      HIDE: undefined,

      UPDATE_NAME: (name: string) => ({ name }),
      UPDATE_ADDRESS: (address: string) => ({ address }),

      ADD_ADDRESS_RECORD: undefined,
      UPDATE_ADDRESS_RECORD: undefined,
    },
  },
  {
    prefix: 'APP/ADDRESS_BOOK'
  }
)

export const AddressBookReducer = handleActions(
  {
    [AddressBookActions.newAddressDialog.show]: (state, action) => ({
      ...state,
      newAddressDialog: {
        isVisible: true,
        isInEditMode: action.payload.addressRecord !== undefined,
        name: action.payload.addressRecord && action.payload.addressRecord.name,
        address: action.payload.addressRecord && action.payload.addressRecord.address
      }
    }),
    [AddressBookActions.newAddressDialog.hide]: state => ({
      ...state,
      newAddressDialog: { isVisible: false }
    }),
    [AddressBookActions.newAddressDialog.updateName]: (state, action) => ({
      ...state,
      newAddressDialog: { ...state.newAddressDialog, name: action.payload.name }
    }),
    [AddressBookActions.newAddressDialog.updateAddress]: (state, action) => ({
      ...state,
      newAddressDialog: { ...state.newAddressDialog, address: action.payload.address }
    }),
  }, defaultAppState)
