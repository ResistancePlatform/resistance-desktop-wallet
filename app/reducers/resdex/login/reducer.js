// @flow
import { createActions, handleActions } from 'redux-actions'
import { preloadedState } from '~/reducers/preloaded.state'

export const ResDexLoginActions = createActions(
  {
    EMPTY: undefined,

    GET_PORTFOLIOS: undefined,
    GOT_PORTFOLIOS: portfolios => ({ portfolios }),
    COPY_SEED_PHRASE: undefined,
    GENERATE_SEED_PHRASE: undefined,
    LEARN_ABOUT_SEED_PHRASE: undefined,
    SEED_PHRASE_GENERATED: (seedPhrase: string) => ({ seedPhrase }),
    CREATE_PORTFOLIO: undefined,

    LOGIN: undefined,
    LOGIN_SUCCEEDED: undefined,
    LOGIN_FAILED: (errorMessage: string) => ({ errorMessage }),
    SHOW_DIALOG: undefined,

    START_RESDEX: (seedPhrase: string, walletPassword: string) => ({ seedPhrase, walletPassword }),
    INIT_RESDEX: (walletPassword: string) => ({ walletPassword }),
    STOP_RESDEX: undefined,

    FORGOT_PASSWORD: undefined,
  },
  {
    prefix: 'APP/RESDEX/LOGIN'
  }
)

export const ResDexLoginReducer = handleActions(
  {
    [ResDexLoginActions.startPortfolioCreation]: state => ({
      ...state,
      isCreatingPortfolio: true,
    }),
    [ResDexLoginActions.gotPortfolios]: (state, action) => ({
      ...state,
      portfolios: action.payload.portfolios
    }),
    [ResDexLoginActions.seedPhraseGenerated]: (state, action) => ({
      ...state,
      generatedSeedPhrase: action.payload.seedPhrase
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
    [ResDexLoginActions.showDialog]: state => ({
      ...state,
      isRequired: true,
    }),
  }, preloadedState)
