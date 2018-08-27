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
  updatingAddress?: AddressBookRow | null,
  addressDialog: {
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
    UPDATE_ADDRESS: undefined,
    EDIT_ADDRESS: (addressToUpdate: AddressRow) => addressToUpdate,
    COPY_ADDRESS: (addressToCopy: AddressRow) => addressToCopy,
    REMOVE_ADDRESS: (addressToRemove: AddressRow) => addressToRemove,

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

const getAddressDialogState = (state: AddressBookState) => state.updatingAddress ? state.updatingAddress : ({ name: '', address: '' })

export const AddressBookReducer = handleActions(
  {
    [AddressBookActions.gotAddressBook]: (state, action) => ({
      ...state, addresses: action.payload
    }),
    [AddressBookActions.updateDropdownMenuVisibility]: (state, action) => ({
      ...state, showDropdownMenu: action.payload.show
    }),
    [AddressBookActions.updateNewAddressDialogVisibility]: (state, action) => ({
      ...state,
      addressDialog: action.payload ? getAddressDialogState(state) : null,
      updatingAddress : action.payload ? state.updatingAddress : null
    }),
    [AddressBookActions.updateNewAddressDialogName]: (state, action) => ({
      ...state,
      addressDialog: state.addressDialog ?
        { name: action.payload, address: state.addressDialog.address } : { name: action.payload, address: '' }
    }),
    [AddressBookActions.updateNewAddressDialogAddress]: (state, action) => ({
      ...state,
      addressDialog: state.addressDialog ?
        { name: state.addressDialog.name, address: action.payload } : { name: '', address: action.payload }
    }),
    [AddressBookActions.editAddress]: (state, action) => ({
      ...state, updatingAddress: action.payload
    }),
  }, defaultAppState)
