// @flow
import { combineEpics } from 'redux-observable'
import { ResDexLoginEpic } from './login/epic'
import { ResDexAccountsEpic } from './accounts/epic'

export const ResDexEpic = combineEpics(
  ResDexLoginEpic,
  ResDexAccountsEpic,
)
