// @flow
import { createActions, handleActions } from 'redux-actions'
import { preloadedState } from '~/reducers/preloaded.state'

export const ResDexBootstrappingActions = createActions(
  {
    EMPTY: undefined,

    START_RESTORING_PORTFOLIO: undefined,
    START_CREATING_PORTFOLIO: undefined,

    COPY_SEED_PHRASE: undefined,
    GENERATE_SEED_PHRASE: undefined,
    LEARN_ABOUT_SEED_PHRASE: undefined,
    SEED_PHRASE_GENERATED: (seedPhrase: string) => ({ seedPhrase }),
    CREATE_PORTFOLIO: undefined,
    FORGOT_PASSWORD: undefined,

    BOOTSTRAPPING_COMPLETED: undefined,
  },
  {
    prefix: 'APP/RESDEX/BOOTSTRAPPING'
  }
)

export const ResDexBootstrappingReducer = handleActions(
  {
    [ResDexBootstrappingActions.startRestoringPortfolio]: state => ({
      ...state,
      isRestoring: true,
    }),
    [ResDexBootstrappingActions.startCreatingPortfolio]: state => ({
      ...state,
      isRestoring: false,
    }),
    [ResDexBootstrappingActions.seedPhraseGenerated]: (state, action) => ({
      ...state,
      generatedSeedPhrase: action.payload.seedPhrase
    }),
    [ResDexBootstrappingActions.bootstrappingCompleted]: state => ({
      ...state,
      isInProgress: false,
    }),
  }, preloadedState)

