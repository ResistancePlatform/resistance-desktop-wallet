// @flow
import { createActions, handleActions } from 'redux-actions'
import { defaultAppState } from '../default-app-state'

export type AddressBookRecord = {
  name: string,
  address: string
}

export type AddressBookState = {
  addresses: AddressBookRecord[],
  newAddressDialog: {
    isVisible: boolean,
    isInEditMode?: boolean,
    originalName?: string,
    name?: string,
    address?: string
  }
}

export const AddressBookActions = createActions(
  {
    EMPTY: undefined,

    LOAD_ADDRESS_BOOK: undefined,
    GOT_ADDRESS_BOOK: (addresses: AddressBookRecords) => ({ addresses }),

    EDIT_ADDRESS: (address: AddressRow) => ({ address }),
    COPY_ADDRESS: (address: AddressRow) => ({ address }),
    REMOVE_ADDRESS: (address: AddressRow) => ({ address }),

    OPEN_NEW_ADDRESS_DIALOG: (addressRecord: AddressBookRecord | undefined) => ({ addressRecord }),

    NEW_ADDRESS_DIALOG: {
      ERROR: (errorMessage: string) => ({ errorMessage }),

      UPDATE_NAME: (name: string) => ({ name }),
      UPDATE_ADDRESS: (address: string) => ({ address }),

      ADD_ADDRESS_RECORD: undefined,
      UPDATE_ADDRESS_RECORD: undefined,

      CLOSE: undefined
    },
  },
  {
    prefix: 'APP/ADDRESS_BOOK'
  }
)

export const AddressBookReducer = handleActions(
  {
    [AddressBookActions.gotAddressBook]: (state, action) => ({
      ...state,
      addresses: action.payload.addresses
    }),
    [AddressBookActions.openNewAddressDialog]: (state, action) => ({
      ...state,
      newAddressDialog: {
        isVisible: true,
        isInEditMode: action.payload.addressRecord !== undefined,
        originalName: action.payload.addressRecord && action.payload.addressRecord.name,
        name: action.payload.addressRecord && action.payload.addressRecord.name,
        address: action.payload.addressRecord && action.payload.addressRecord.address
      }
    }),
    [AddressBookActions.newAddressDialog.close]: state => ({
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
