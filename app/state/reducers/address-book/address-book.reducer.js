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
    fields: {
      name?: string,
      address?: string
    },
    isInEditMode?: boolean,
    isSubmitButtonDisabled?: boolean,
    validationErrors: { [string]: string },
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

      UPDATE_NAME_FIELD: (value: string) => value,
      UPDATE_ADDRESS_FIELD: (value: string) => value,

      ADD_ADDRESS: undefined,
      UPDATE_ADDRESS: undefined,

      VALIDATE_FORM: (nextActionCreator: func) => ({ nextActionCreator }),
      VALIDATE_FIELD: (field: string, value: string, nextActionCreator: func) => ({ field, value, nextActionCreator }),
      VALIDATE_FORM_FAILURE: (errors) => ({ errors }),

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
        validationErrors: {},
        isVisible: true
      }
    }),
    [AddressBookActions.newAddressDialog.validateFormFailure]: (state, action) => ({
      ...state,
      newAddressDialog: {
        ...state.newAddressDialog,
        validationErrors: action.payload.errors,
        isSubmitButtonDisabled: Object.keys(action.payload.errors).length > 0
      }
    }),
    [AddressBookActions.newAddressDialog.close]: state => ({
      ...state,
      newAddressDialog: { fields: {}, validationErrors: {}, isVisible: false }
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
  }, preloadedState)
