// @flow
import { createActions, handleActions } from 'redux-actions'
import { defaultAppState } from '../default-app-state'

export type AddressBookRow = {
  name: string,
  address: string
}

export type AddressBookState = {
  addresses?: AddressBookRow[],
  showDropdownMenu?: boolean,
  newAddressDialog: {
    name: string,
    address: string
  } | null
}

export const AddressBookActions = createActions(
  {
    EMPTY: undefined,

    LOAD_ADDRESS_BOOK: undefined,
    GOT_ADDRESS_BOOK: (addresses: AddressBookRow[]) => addresses,

    ADD_ADDRESS: undefined,
    REMOVE_ADDRESS: (addressToRemove: AddressRow) => addressToRemove,
    COPY_ADDRESS: (addressToCopy: AddressRow) => addressToCopy,

    UPDATE_DROPDOWN_MENU_VISIBILITY: (show: boolean) => ({ show }),

    UPDATE_NEW_ADDRESS_DIALOG_VISIBILITY: (show: boolean) => show,
    UPDATE_NEW_ADDRESS_DIALOG_NAME: (name: string) => name,
    UPDATE_NEW_ADDRESS_DIALOG_ADDRESS: (address: string) => address,
    PASTE_ADDRESS_FROM_CLIPBOARD: undefined
  },
  {
    prefix: 'APP/ADDRESS_BOOK'
  }
)

export const AddressBookReducer = handleActions(
  {
    [AddressBookActions.gotAddressBook]: (state, action) => ({
      ...state, addresses: action.payload
    }),
    [AddressBookActions.updateDropdownMenuVisibility]: (state, action) => ({
      ...state, showDropdownMenu: action.payload.show
    }),
    [AddressBookActions.updateNewAddressDialogVisibility]: (state, action) => ({
      ...state, newAddressDialog: action.payload ? { name: '', address: '' } : null
    }),
    [AddressBookActions.updateNewAddressDialogName]: (state, action) => ({
      ...state,
      newAddressDialog: state.newAddressDialog ?
        { name: action.payload, address: state.newAddressDialog.address } : { name: action.payload, address: '' }
    }),
    [AddressBookActions.updateNewAddressDialogAddress]: (state, action) => ({
      ...state,
      newAddressDialog: state.newAddressDialog ?
        { name: state.newAddressDialog.name, address: action.payload } : { name: '', address: action.payload }
    })
  }, defaultAppState)
