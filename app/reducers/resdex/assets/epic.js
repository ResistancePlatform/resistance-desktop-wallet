// @flow
import log from 'electron-log'
import { of, from, merge } from 'rxjs'
import { switchMap, catchError } from 'rxjs/operators'
import { ofType } from 'redux-observable'
import { actions as toastrActions } from 'react-redux-toastr'

import { translate } from '~/i18next.config'
import { CurrencyHistoryService } from '~/service/resdex/currency-history'
import { ResDexAssetsActions } from '~/reducers/resdex/assets/reducer'


const t = translate('resdex')
const currencyHistory = new CurrencyHistoryService()

const getCurrencyHistoryEpic = (action$: ActionsObservable<Action>, state$) => action$.pipe(
	ofType(ResDexAssetsActions.getCurrencyHistory),
  switchMap(() => {
    const { enabledCurrencies } = state$.value.resDex.accounts
    const symbols = enabledCurrencies.map(currency => currency.symbol)

    const observable = from(currencyHistory.fetch(symbols)).pipe(
      switchMap(history => {
        log.debug(`Currency history fetched for ${symbols.length} symbols.`)
        return of(ResDexAssetsActions.gotCurrencyHistory(history))
      }),
      catchError(err => {
        log.error(`Error getting currency history`, err)

        return of(
          toastrActions.add({
            type: 'error',
            title: t(`Error getting currency history`)
          }),
          ResDexAssetsActions.getCurrencyHistoryFailed()
        )
      })
    )

    return observable
  })
)

export const ResDexAssetsEpic = (action$, state$) => merge(
  getCurrencyHistoryEpic(action$, state$),
)

