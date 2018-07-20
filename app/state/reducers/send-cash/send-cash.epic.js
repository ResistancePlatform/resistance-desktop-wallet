// @flow
import { map, tap, switchMap } from 'rxjs/operators'
import { merge, of } from 'rxjs'
import { ActionsObservable, ofType } from 'redux-observable'
import { AppAction } from '../appAction'
import { SendCashActions, SendCashState } from './send-cash.reducer'
// import { ResistanceCliService } from '../../../service/resistance-cli-service'
import { DialogService } from '../../../service/dialog-service'
import { LoggerService, ConsoleTheme } from '../../../service/logger-service'

const epicInstanceName = 'SendCashEpics'
// const resistanceCliService = new ResistanceCliService()
const dialogService: DialogService = new DialogService()
const logger = new LoggerService()

const isPrevSendTransactionInProgress = (sendCashState: SendCashState) => sendCashState.currentOperation !== null && sendCashState.currentOperation !== undefined


const showUserErrorMessageEpic = (action$: ActionsObservable<AppAction>) => action$.pipe(
    ofType(SendCashActions.SHOW_USER_ERROR_MESSAGE),
    tap((action: AppAction) => logger.debug(epicInstanceName, `showUserErrorMessageEpic`, action.type, ConsoleTheme.testing)),
    tap((action: AppAction) => dialogService.showError(action.payload.title, action.payload.message)),
    map(() => SendCashActions.empty())
)

const sendCashEpic = (action$: ActionsObservable<AppAction>, state$) => action$.pipe(
    ofType(SendCashActions.SEND_CASH),
    tap((action: AppAction) => logger.debug(epicInstanceName, `sendCashEpic`, action.type, ConsoleTheme.testing)),
    switchMap(() => {
        if (isPrevSendTransactionInProgress(state$.value.sendCash)) {
            return of(SendCashActions.sendCashFail(`The prev send operation is still in progress.`, false))
        }

        return of(SendCashActions.updateSendOperationStatus({
            operationId: `11111`,
            status: `queued`,
            result: ``
        }))
    })
)

const sendCashFailEpic = (action$: ActionsObservable<AppAction>) => action$.pipe(
    ofType(SendCashActions.SEND_CASH_FAIL),
    tap((action: AppAction) => logger.debug(epicInstanceName, `sendCashFailEpic`, action.type, ConsoleTheme.testing)),
    tap((action: AppAction) => dialogService.showError(`Send Cash Fail`, action.payload.errorMessage)),
    map(() => SendCashActions.empty())
)

export const SendCashEpics = (action$, state$) => merge(
    showUserErrorMessageEpic(action$, state$),
    sendCashEpic(action$, state$),
    sendCashFailEpic(action$, state$)
)
