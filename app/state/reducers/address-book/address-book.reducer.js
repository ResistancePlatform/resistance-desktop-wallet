// @flow
import { createActions, handleActions } from 'redux-actions'
import { preloadedState } from '../preloaded.state'

export type AddressBookRecord = {
  name: string,
  address: string
}

export type AddressBookState = {
  records: AddressBookRecord[],
  newAddressDialog: {
    originalName?: string,
    defaultValues: {
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
    CONFIRM_ADDRESS_REMOVAL: (record: AddressBookRecord) => ({ record }),
    REMOVE_ADDRESS: (record: AddressBookRecord) => ({ record }),

    OPEN_NEW_ADDRESS_DIALOG: (record: AddressBookRecord | undefined) => ({ record }),

    NEW_ADDRESS_DIALOG: {
      ERROR: (errorMessage: string) => ({ errorMessage }),

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
        defaultValues: Object.assign({}, action.payload.record || {}),
        isInEditMode: action.payload.record !== undefined,
        isVisible: true
      }
    }),
    [AddressBookActions.newAddressDialog.close]: state => ({
      ...state,
      newAddressDialog: { defaultValues: {}, isVisible: false }
    }),
  }, preloadedState)
