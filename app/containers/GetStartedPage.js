// @flow
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

import { GetStartedActions } from '../state/reducers/get-started/get-started.reducer'
import { SettingsActions } from '../state/reducers/settings/settings.reducer'
import { GetStarted } from '../components/get-started/GetStarted'
import { CreateNewWallet } from '../components/get-started/CreateNewWallet'
import { ChoosePassword } from '../components/get-started/ChoosePassword'
import { RestoreYourWallet } from '../components/get-started/RestoreYourWallet'
import { Welcome } from '../components/get-started/Welcome'

const connectComponent = component => (
  connect(
    state => ({ getStarted: state.getStarted }),
    dispatch => ({
      actions: bindActionCreators(GetStartedActions, dispatch),
      settingsActions: bindActionCreators(SettingsActions, dispatch),
    }))(component)
)

export default {
  GetStartedPage: connectComponent(GetStarted),
  CreateNewWalletPage: connectComponent(CreateNewWallet),
  ChoosePasswordPage: connectComponent(ChoosePassword),
  RestoreYourWalletPage: connectComponent(RestoreYourWallet),
  WelcomePage: connectComponent(Welcome)
}
