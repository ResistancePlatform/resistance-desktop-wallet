// @flow
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

import { GetStartedActions } from '~/state/reducers/get-started/get-started.reducer'
import { Welcome } from '~/components/get-started/Welcome'

const mapStateToProps = state => ({
  getStarted: state.getStarted,
  welcome: state.getStarted.welcome,
  roundedForm: state.roundedForm
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(GetStartedActions.welcome, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(Welcome)
