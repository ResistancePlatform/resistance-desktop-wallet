// @flow
import { combineEpics } from 'redux-observable'
import { merge } from 'rxjs'

import { ResDexBootstrappingEpic } from './bootstrapping/epic'
import { ResDexLoginEpic } from './login/epic'
import { ResDexAssetsEpic } from './assets/epic'
import { ResDexBuySellEpic } from './buy-sell/epic'
import { ResDexOrdersEpic } from './orders/epic'
import { ResDexAccountsEpic } from './accounts/epic'


export const defaultEpic = () => merge(
  // Add ResDEX epics here
  // ...
)

export const ResDexEpic = combineEpics(
  defaultEpic,
  ResDexBootstrappingEpic,
  ResDexLoginEpic,
  ResDexAssetsEpic,
  ResDexBuySellEpic,
  ResDexOrdersEpic,
  ResDexAccountsEpic,
)
