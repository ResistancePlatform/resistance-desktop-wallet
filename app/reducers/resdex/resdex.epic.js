// @flow
import { combineEpics } from 'redux-observable'
import { ResDexLoginEpic } from './login/epic'

export const ResDexEpic = combineEpics(
  ResDexLoginEpic,
)
