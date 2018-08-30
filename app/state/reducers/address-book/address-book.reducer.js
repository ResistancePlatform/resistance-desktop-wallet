// @flow
import { createActions, handleActions } from 'redux-actions'
import { defaultAppState } from '../default-app-state'

export type AddressBookRecord = {
  name: string,
  address: string
}

export type AddressBookState = {
  records: AddressBookRecord[],
  newAddressDialog: {
    originalName?: string,
    fields: {
      name?: string,
      address?: string
    },
    isInEditMode?: boolean,
    isVisible: boolean
  }
}

export const AddressBookActions = createActions(
  {
    EMPTY: undefined,

    LOAD_ADDRESS_BOOK: undefined,
    GOT_ADDRESS_BOOK: (records: AddressBookRecord[]) => ({ records }),

    EDIT_ADDRESS: (record: AddressBookRecord) => ({ record }),
    COPY_ADDRESS: (record: AddressBookRecord) => ({ record }),
    REMOVE_ADDRESS: (record: AddressBookRecord) => ({ record }),

    OPEN_NEW_ADDRESS_DIALOG: (record: AddressBookRecord | undefined) => ({ record }),

    NEW_ADDRESS_DIALOG: {
      ERROR: (errorMessage: string) => ({ errorMessage }),

      UPDATE_NAME_FIELD: (value: string) => value,
      UPDATE_ADDRESS_FIELD: (value: string) => value,

      ADD_ADDRESS: undefined,
      UPDATE_ADDRESS: undefined,

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
      records: action.payload.records
    }),
    [AddressBookActions.openNewAddressDialog]: (state, action) => ({
      ...state,
      newAddressDialog: {
        originalName: action.payload.record && action.payload.record.name,
        fields: Object.assign({}, action.payload.record || {}),
        isInEditMode: action.payload.record !== undefined,
        isVisible: true
      }
    }),
    [AddressBookActions.newAddressDialog.close]: state => ({
      ...state,
      newAddressDialog: { fields: {}, isVisible: false }
    }),
    [AddressBookActions.newAddressDialog.updateNameField]: (state, action) => {
      const newState = Object.assign({}, state)
      newState.newAddressDialog.fields.name = action.payload
      return newState
    },
    [AddressBookActions.newAddressDialog.updateAddressField]: (state, action) => {
      const newState = Object.assign({}, state)
      newState.newAddressDialog.fields.address = action.payload
      return newState
    },
  }, defaultAppState)
