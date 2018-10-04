// @flow
import { createActions, handleActions } from 'redux-actions'

import { translate } from '~/i18next.config'
import { preloadedState } from '../preloaded.state'


const t = translate('other')

export type Order = {}

export type FetchParametersState = {
  progressRate: number,
  statusMessage: string,
  errorMessage: string | null,
  isDownloadComplete: boolean
}

export const FetchParametersActions = createActions(
  {
    EMPTY: undefined,

    FETCH: undefined,
    STATUS: (message: string) => ({ message }),

    DOWNLOAD_PROGRESS: (receivedBytes: number, totalBytes: number) => ({ receivedBytes, totalBytes }),
    DOWNLOAD_COMPLETE: undefined,
    DOWNLOAD_FAILED: (errorMessage: string) => ({ errorMessage }),
  },
  {
    prefix: 'APP/FETCH_PARAMETERS'
  }
)

export const FetchParametersReducer = handleActions(
  {
    [FetchParametersActions.fetch]: state => ({
      ...state,
      isDownloadComplete: false,
      progressRate: 0,
      errorMessage: null
    }),
    [FetchParametersActions.downloadProgress]: (state, action) => {
      const { receivedBytes, totalBytes } = action.payload

      const simpleRate = receivedBytes / totalBytes
      const progressRate = simpleRate * 100.0
      const roundedRate = Math.round(progressRate)
      const totalMb = (totalBytes / 1024 / 1024).toFixed(2)
      const receivedMb = (simpleRate  * totalMb).toFixed(2)

      const statusMessage = t(
        `Download in progress, received {{receivedMb}}MB out of {{totalMb}}MB ({{roundedRate}}%)`,
        { receivedMb, totalMb, roundedRate }
      )

      return { ...state, progressRate, statusMessage }
    },
    [FetchParametersActions.downloadComplete]: state => ({
      ...state,
      isDownloadComplete: true,
      progressRate: 100.0,
      statusMessage: t(`Download complete`)
    }),
    [FetchParametersActions.downloadFailed]: (state, action) => ({
      ...state,
      progressRate: 0,
      statusMessage: t(`Download failed`),
      errorMessage: action.payload.errorMessage
    })
  }, preloadedState)
