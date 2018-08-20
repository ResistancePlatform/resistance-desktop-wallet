// @flow
import { createActions, handleActions } from 'redux-actions'

export type PopupMenuState = {
}

export const PopupMenuActions = createActions(
	{
    SHOW: (id, top, left) => ({ id, top, left }),
    HIDE: id => ({ id })
  },
	{
		prefix: 'APP/POPUP_MENU'
	}
)

export const PopupMenuReducer = handleActions({
  [PopupMenuActions.show]: (state, action) => ({
    ...state, [action.payload.id]: { ...action.payload, isVisible: true }
  }),
  [PopupMenuActions.hide]: (state, action) => ({
    ...state, [action.payload.id]: { ...state[action.payload.id], isVisible: false }
  }),
})
