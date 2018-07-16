// @flow
import { remote } from 'electron'
import { map, tap } from 'rxjs/operators'
import { merge } from 'rxjs'

import { ActionsObservable, ofType } from 'redux-observable'
// import { Store } from 'redux'
import { AppAction } from '../appAction'

import { NaviActions } from './navi.reducer'

// const logger = LoggerService.getInstance()
// const service = DataProxyService.getInstance()
const epicInstanceName = 'NaviEpics'

// const naviToPathEpic = (action$: ActionsObservable<AppAction>) => action$.pipe(
//     ofType(NaviActions.NAVI_TO_PATH),
//     // tap(action => logger.debug(`${epicInstanceName}`, `loadTopListEpic`, `action:`, ConsoleTheme.testing, action)),
//     tap((action: AppAction) => console.log(`[ ${epicInstanceName} ] - loadBalancesEpic, ${action.type}`)),
//     switchMap(() => resistanceCliService.getBalance()),
//     map(result => result ? NaviActions.loadBalancesSuccess(result) : NaviActions.loadBalancesFail('Cannot load balance.')),
//     catchError(error => {
//         // console.error(`error: `, error)
//         const errorMessage = error.code && error.code === 'ECONNREFUSED' ? 'Cannot connect to "resistanced" service.' : error
//         return of(NaviActions.loadBalancesFail(errorMessage))
//     })
// )

const naviPathChangedEpic = (action$: ActionsObservable<AppAction>) => action$.pipe(
    ofType('@@router/LOCATION_CHANGE'),
    tap((action) => console.log(`[ ${epicInstanceName} ] - naviPathChangedEpic, pathname: ${action.payload.pathname}`)),
    map((action) => NaviActions.naviToPathSuccess(action.payload.pathname))
)


const mainWindowCloseEpic = (action$: ActionsObservable<AppAction>) => action$.pipe(
    ofType(NaviActions.MAIN_WINDOW_CLOSE),
    tap(() => setTimeout(() => {
        remote.getCurrentWindow().close()
    }, 100)),
    map(() => NaviActions.empty())
)

const mainWindowMinimizeEpic = (action$: ActionsObservable<AppAction>) => action$.pipe(
    ofType(NaviActions.MAIN_WINDOW_MINIMIZE),
    tap(() => setTimeout(() => {
        remote.getCurrentWindow().minimize()
    }, 100)),
    map(() => NaviActions.empty())
)

const mainWindowMaximizeEpic = (action$: ActionsObservable<AppAction>) => action$.pipe(
    ofType(NaviActions.MAIN_WINDOW_MAXIMIZE),
    tap(() => setTimeout(() => {
        const win = remote.getCurrentWindow()

        if (process.platform === 'darwin') {
            win.setFullScreen(!win.isFullScreen())
        } else {
            win.isMaximized() ? win.unmaximize() : win.maximize()
        }
    }, 100)),
    map(() => NaviActions.empty())
)


export const NaviEpics = (action$, state$) => merge(
    naviPathChangedEpic(action$, state$),
    mainWindowCloseEpic(action$, state$),
    mainWindowMinimizeEpic(action$, state$),
    mainWindowMaximizeEpic(action$, state$)
)
