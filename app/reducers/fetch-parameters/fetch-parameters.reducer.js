// @flow
import { createActions, handleActions } from 'redux-actions'

import { preloadedState } from '../preloaded.state'

export type Order = {}

export type FetchParametersState = {
  progressRate: number,
  isDownloadComplete: boolean
}

export const FetchParametersActions = createActions(
  {
    EMPTY: undefined,
    DOWNLOAD_COMPLETE: undefined,
  },
  {
    prefix: 'APP/FETCH_PARAMETERS'
  }
)

export const FetchParametersReducer = handleActions(
  {
    [FetchParametersActions.downloadComplete]: state => ({
      ...state,
      isDownloadComplete: true,
    })
  }, preloadedState)
