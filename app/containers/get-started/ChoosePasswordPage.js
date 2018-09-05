// @flow
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

import { GetStartedActions } from '~/state/reducers/get-started/get-started.reducer'
import { ChoosePassword } from '~/components/get-started/ChoosePassword'

const mapStateToProps = state => ({
	choosePassword: state.getStarted.choosePassword
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(GetStartedActions.choosePassword, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(ChoosePassword)

