// @flow
import { createActions, handleActions } from 'redux-actions'

import { preloadedState } from '~/reducers/preloaded.state'
import { ResDexBootstrappingActions } from '~/reducers/resdex/bootstrapping/reducer'


export const ResDexLoginActions = createActions(
  {
    EMPTY: undefined,

    GET_PORTFOLIOS: undefined,
    GOT_PORTFOLIOS: portfolios => ({ portfolios }),
    UPDATE_PORTFOLIO: (id: string, fields: object) => ({ id, fields }),

    LOGIN: undefined,
    LOGIN_SUCCEEDED: undefined,
    LOGIN_FAILED: (errorMessage: string) => ({ errorMessage }),
    SHOW_DIALOG: undefined,

    CONFIRM_LOGOUT: undefined,
    LOGOUT: undefined,
    LOGOUT_SUCCEEDED: undefined,
    LOGOUT_FAILED: undefined,

    SHOW_TERMS_AND_CONDITIONS_MODAL: undefined,
    CLOSE_TERMS_AND_CONDITIONS_MODAL: undefined,

    SET_DEFAULT_PORTFOLIO: (id: string) => ({ id }),

    START_RESDEX: (seedPhrase: string, walletPassword: string) => ({ seedPhrase, walletPassword }),
    INIT_RESDEX: (processName: string, walletPassword: string) => ({ processName, walletPassword }),
    STOP_RESDEX: undefined,
  },
  {
    prefix: 'APP/RESDEX/LOGIN'
  }
)

export const ResDexLoginReducer = handleActions(
  {
    [ResDexLoginActions.gotPortfolios]: (state, action) => ({
      ...state,
      portfolios: action.payload.portfolios
    }),
    [ResDexLoginActions.login]: state => ({
      ...state,
      isInProgress: true,
    }),
    [ResDexLoginActions.loginSucceeded]: state => ({
      ...state,
      isRequired: false,
      isInProgress: false,
    }),
    [ResDexLoginActions.loginFailed]: state => ({
      ...state,
      isRequired: true,
      isInProgress: false,
    }),
    [ResDexLoginActions.showTermsAndConditionsModal]: state => ({
      ...state,
      termsAndConditionsModal: {
        isVisible: true,
      }
    }),
    [ResDexLoginActions.closeTermsAndConditionsModal]: state => ({
      ...state,
      termsAndConditionsModal: {
        isVisible: false,
      }
    }),
    [ResDexLoginActions.showDialog]: state => ({
      ...state,
      isRequired: true,
    }),
    [ResDexLoginActions.logout]: state => ({
      ...state,
      isInProgress: true,
    }),
    [ResDexLoginActions.logoutSucceeded]: state => ({
      ...state,
      isInProgress: false,
      isRequired: true,
    }),
    [ResDexLoginActions.logoutFailed]: state => ({
      ...state,
      isInProgress: false,
      isRequired: false,
    }),
    [ResDexLoginActions.setDefaultPortfolio]: (state, action) => ({
      ...state,
      defaultPortfolioId: action.payload.id,
    }),
    [ResDexBootstrappingActions.createPortfolio]: state => ({
      ...state,
      isInProgress: true,
    }),
  }, preloadedState)
