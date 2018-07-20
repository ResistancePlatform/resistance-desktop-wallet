// @flow
import { map, tap, switchMap } from 'rxjs/operators'
import { merge } from 'rxjs'
import { ActionsObservable, ofType } from 'redux-observable'
import { AppAction } from '../appAction'
import { SendCashActions } from './send-cash.reducer'
// import { ResistanceCliService } from '../../../service/resistance-cli-service'
import { DialogService } from '../../../service/dialog-service'
import { LoggerService, ConsoleTheme } from '../../../service/logger-service'

const epicInstanceName = 'SendCashEpics'
// const resistanceCliService = new ResistanceCliService()
const dialogService: DialogService = new DialogService()
const logger = new LoggerService()

const showUserErrorMessageEpic = (action$: ActionsObservable<AppAction>) => action$.pipe(
    ofType(SendCashActions.SHOW_USER_ERROR_MESSAGE),
    tap((action: AppAction) => logger.debug(epicInstanceName, `showUserErrorMessageEpic`, action.type, ConsoleTheme.testing)),
    tap((action: AppAction) => dialogService.showError(action.payload.title, action.payload.message)),
    map(() => SendCashActions.empty())
)


export const SendCashEpics = (action$, state$) => merge(
    showUserErrorMessageEpic(action$, state$)
)
