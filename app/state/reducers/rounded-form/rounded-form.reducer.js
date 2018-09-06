// @flow
import { createActions, handleActions } from 'redux-actions'
import { preloadedState } from '../preloaded.state'

type ValidationErrors = {
  [string]: string
}

export type RoundedFormRoot = {
  fields: { [string]: any },
  errors: ValidationErrors,
  isValid: boolean
}

export type RoundedFormState = { [string]: RoundedFormRoot }

export const RoundedFormActions = createActions(
	{
    INIT: (formId: string, fields: object = {}) => ({ formId, fields }),
    UPDATE_FIELD: (formId: string, field: string, value: string | undefined) => ({ formId, field, value }),
    UPDATE_ERRORS: (formId: string, errors: ValidationErrors, isValid: boolean) => ({ formId, errors, isValid })
  },
	{
		prefix: 'APP/ROUNDED_FORM'
	}
)

export const RoundedFormReducer = handleActions({
  [RoundedFormActions.init]: (state, action) => ({
    ...state,
    [action.payload.formId]: {
      fields: action.payload.fields,
      errors: {},
      isValid: false
    }
  }),
  [RoundedFormActions.updateField]: (state, action) => ({
    ...state,
    [action.payload.formId]: {
      ...state[action.payload.formId] || {},
      fields: {
        ...state[action.payload.formId].fields || {},
        [action.payload.field]: action.payload.value
      }
    }
  }),
  [RoundedFormActions.updateErrors]: (state, action) => ({
    ...state,
    [action.payload.formId]: {
      ...state[action.payload.formId] || {},
      errors: action.payload.errors,
      isValid: action.payload.isValid
    }
  })
}, preloadedState)
