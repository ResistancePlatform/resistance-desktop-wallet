// @flow
import { combineEpics, ofType } from 'redux-observable'
import { of, merge } from 'rxjs'
import { switchMap, delay } from 'rxjs/operators'
import { actions as toastrActions } from 'react-redux-toastr'

import { translate } from '~/i18next.config'
import { ChildProcessService } from '~/service/child-process-service'
import { ResDexAccountsActions } from './accounts/reducer'
import { ResDexActions } from './resdex.reducer'
import { ResDexService } from '~/service/resdex/resdex'
import { ResDexLoginEpic } from './login/epic'
import { ResDexAssetsEpic } from './assets/epic'
import { ResDexBuySellEpic } from './buy-sell/epic'
import { ResDexOrdersEpic } from './orders/epic'
import { ResDexAccountsEpic } from './accounts/epic'


const t = translate('resdex')
const resDex = new ResDexService()
const childProcess = new ChildProcessService()

const startResDexEpic = (action$: ActionsObservable<Action>) => action$.pipe(
	ofType(ResDexActions.startResdex),
  switchMap(() => {
    const resDexStartedObservable = childProcess.getObservable({
      processName: 'RESDEX',
      onSuccess: of(ResDexAccountsActions.enableCurrencies()).pipe(delay(10000)),
      onFailure: of(toastrActions.add({ type: 'error', title: t('Unable to start ResDEX, check the log for details') })),
      action$
    })

		resDex.start()
    return resDexStartedObservable
  })
)

export const defaultEpic = (action$, state$) => merge(
  startResDexEpic(action$, state$),
)

export const ResDexEpic = combineEpics(
  defaultEpic,
  ResDexLoginEpic,
  ResDexAssetsEpic,
  ResDexBuySellEpic,
  ResDexOrdersEpic,
  ResDexAccountsEpic,
)
