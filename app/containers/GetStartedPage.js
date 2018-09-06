// @flow
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

import { GetStartedActions } from '../state/reducers/get-started/get-started.reducer'
import { SettingsActions } from '../state/reducers/settings/settings.reducer'
import { GetStarted } from '../components/get-started/GetStarted'
import { ChoosePassword } from '../components/get-started/ChoosePassword'
import { RestoreYourWallet } from '../components/get-started/RestoreYourWallet'

const connectComponent = component => (
  connect(state => ({
      getStarted: state.getStarted,
      createNewWallet: state.getStarted.createNewWallet
    }),
    dispatch => ({
      actions: bindActionCreators(GetStartedActions, dispatch),
      settingsActions: bindActionCreators(SettingsActions, dispatch),
    }))(component)
)

export default {
  GetStartedPage: connectComponent(GetStarted),
  ChoosePasswordPage: connectComponent(ChoosePassword),
  RestoreYourWalletPage: connectComponent(RestoreYourWallet),
}
