// @flow
import log from 'electron-log'
import moment from 'moment'
import { createActions, handleActions } from 'redux-actions'

import { translate } from '~/i18next.config'
import { preloadedState } from '../preloaded.state'


const t = translate('other')

export type Order = {}

export type FetchParametersState = {
  progressRate: number,
  startedAt: object | null,
  minutesLeft: number | null,
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
      startedAt: moment(),
      errorMessage: null
    }),
    [FetchParametersActions.downloadProgress]: (state, action) => {
      const { receivedBytes, totalBytes } = action.payload

      const simpleRate = receivedBytes / (totalBytes + 1)
      const progressRate = simpleRate * 100.0
      const totalMb = (totalBytes / 1024 / 1024).toFixed(2)

      const { startedAt } = state
      let minutesLeft = null

      if (startedAt) {
        const bytesPerSecond = receivedBytes / (moment().diff(startedAt, 'seconds') + 1)
        minutesLeft = (totalBytes - receivedBytes) / (bytesPerSecond + 1) / 60

        // Don't show time that doesn't make sense
        if (minutesLeft > 24 * 60 * 7) {
          minutesLeft = null
        }
      }

      const statusMessage = t(`Downloading Resistance parameters`)

      return {
        ...state,
        progressRate,
        statusMessage,
        minutesLeft
      }
    },
    [FetchParametersActions.status]: (state, action) => ({
      ...state,
      statusMessage: action.payload.message,
    }),
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
      startedAt: null,
      errorMessage: action.payload.errorMessage
    })
  }, preloadedState)
