// @flow
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

import { GetStartedActions } from '~/state/reducers/get-started/get-started.reducer'
import { CreateNewWallet } from '~/components/get-started/CreateNewWallet'

const mapStateToProps = state => ({
	createNewWallet: state.getStarted.createNewWallet
})

const mapDispatchToProps = dispatch => ({
  getStartedActions: bindActionCreators(GetStartedActions, dispatch),
  actions: bindActionCreators(GetStartedActions.createNewWallet, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(CreateNewWallet)
