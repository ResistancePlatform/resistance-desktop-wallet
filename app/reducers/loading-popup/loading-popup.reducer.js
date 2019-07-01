// @flow
import { createActions, handleActions } from 'redux-actions'
import { preloadedState } from '../preloaded.state'

export type LoadingPopupState = {
  isVisible: boolean,
  message: string
}

export const LoadingPopupActions = createActions(
	{
    SHOW: (message: string) => ({ message }),
    HIDE: undefined
  },
	{
		prefix: 'APP/LOADING_POPUP'
	}
)

export const LoadingPopupReducer = handleActions({
  [LoadingPopupActions.show]: (state, action) => ({
    ...state,
    isVisible: true,
    message: action.payload.message,
  }),
  [LoadingPopupActions.hide]: state => ({
    ...state,
    isVisible: false,
  })
}, preloadedState)
