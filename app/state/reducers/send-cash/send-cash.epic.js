// @flow
import { map, tap, switchMap } from 'rxjs/operators';
import { merge } from 'rxjs';
import { ActionsObservable, ofType } from 'redux-observable';
import { AppAction } from '../appAction';
import { SendCashActions, SendCashState } from './send-cash.reducer';
import { ResistanceCliService } from '../../../service/resistance-cli-service';
import { DialogService } from '../../../service/dialog-service';
import { LoggerService, ConsoleTheme } from '../../../service/logger-service';

const epicInstanceName = 'SendCashEpics';
const resistanceCliService = new ResistanceCliService();
const dialogService: DialogService = new DialogService();
const logger = new LoggerService();

const isPrevSendTransactionInProgress = (sendCashState: SendCashState) =>
  sendCashState.currentOperation !== null &&
  sendCashState.currentOperation !== undefined;

const allowToSend = (sendCashState: SendCashState) => {
  if (
    sendCashState.fromAddress.trim() === '' ||
    sendCashState.toAddress.trim() === ''
  ) {
    return '"FROM ADDRESS" or "DESTINATION ADDRESS" is required.';
  } else if (
    sendCashState.fromAddress.trim() === sendCashState.toAddress.trim()
  ) {
    return '"FROM ADDRESS" or "DESTINATION ADDRESS" cannot be the same.';
  } else if (sendCashState.amount <= 0.0001) {
    return '"AMOUNT" is required.';
  }

  return 'ok';
};

const showUserErrorMessageEpic = (action$: ActionsObservable<AppAction>) =>
  action$.pipe(
    ofType(SendCashActions.SHOW_USER_ERROR_MESSAGE),
    tap((action: AppAction) =>
      logger.debug(
        epicInstanceName,
        `showUserErrorMessageEpic`,
        action.type,
        ConsoleTheme.testing
      )
    ),
    tap((action: AppAction) =>
      dialogService.showError(action.payload.title, action.payload.message)
    ),
    map(() => SendCashActions.empty())
  );

const sendCashEpic = (action$: ActionsObservable<AppAction>, state$) =>
  action$.pipe(
    ofType(SendCashActions.SEND_CASH),
    tap((action: AppAction) =>
      logger.debug(
        epicInstanceName,
        `sendCashEpic`,
        action.type,
        ConsoleTheme.testing
      )
    ),
    map(() => {
      if (isPrevSendTransactionInProgress(state$.value.sendCash)) {
        return SendCashActions.sendCashFail(
          `The prev send operation is still in progress.`,
          false
        );
      }

      const isAllowedToSend = allowToSend(state$.value.sendCash);
      if (isAllowedToSend !== 'ok') {
        return SendCashActions.sendCashFail(isAllowedToSend, false);
      }

      return SendCashActions.empty();
    }),
    tap((action: AppAction) => {
      // Only fire real send if no error above
      if (action.type === SendCashActions.EMPTY) {
        const state = state$.value.sendCash;

        // Run in Async, `resistanceCliService` will update the state by firing one or more `updateSendOperationStatus()` action
        resistanceCliService.sendCash(
          state.fromAddress,
          state.toAddress,
          state.amount
        );
      }
    })
  );

const sendCashSuccessEpic = (action$: ActionsObservable<AppAction>, state$) =>
  action$.pipe(
    ofType(SendCashActions.SEND_CASH_SUCCESS),
    tap((action: AppAction) =>
      logger.debug(
        epicInstanceName,
        `sendCashSuccessEpic`,
        action.type,
        ConsoleTheme.testing
      )
    ),
    tap(() => {
      const sendCashState = state$.value.sendCash;
      const message = `Successfully sent ${
        sendCashState.amount
      } RES from address:\n ${sendCashState.fromAddress} \n\n to address:\n ${
        sendCashState.toAddress
      }`;
      dialogService.showMessage(`Cash Sent Successfully`, message);
    }),
    map(() => SendCashActions.empty())
  );

const sendCashFailEpic = (action$: ActionsObservable<AppAction>) =>
  action$.pipe(
    ofType(SendCashActions.SEND_CASH_FAIL),
    tap((action: AppAction) =>
      logger.debug(
        epicInstanceName,
        `sendCashFailEpic`,
        action.type,
        ConsoleTheme.testing
      )
    ),
    tap((action: AppAction) =>
      dialogService.showError(`Cash Send Fail`, action.payload.errorMessage)
    ),
    map(() => SendCashActions.empty())
  );

const getAddressListEpic = (action$: ActionsObservable<AppAction>, state$) =>
  action$.pipe(
    ofType(SendCashActions.GET_ADDRESS_LIST),
    tap((action: AppAction) =>
      logger.debug(
        epicInstanceName,
        `getAddressListEpic`,
        action.type,
        ConsoleTheme.testing
      )
    ),
    switchMap(() => {
      const sendCashState = state$.value.sendCash;
      return resistanceCliService.getWalletAddressAndBalance(
        sendCashState.sendFromRadioButtonType === 'private'
      );
    }),
    map(result => SendCashActions.getAddressListSuccess(result))
  );

export const SendCashEpics = (action$, state$) =>
  merge(
    showUserErrorMessageEpic(action$, state$),
    sendCashEpic(action$, state$),
    sendCashSuccessEpic(action$, state$),
    sendCashFailEpic(action$, state$),
    getAddressListEpic(action$, state$)
  );
