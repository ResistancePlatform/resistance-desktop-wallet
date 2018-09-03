// @flow
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

import { GetStartedActions } from '../../state/reducers/get-started/get-started.reducer'
import { GetStarted } from '../components/get-started/GetStarted'

const mapStateToProps = (state) => ({
	getStarted: state.getStarted
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(GetStartedActions, dispatch),
})

export default connect(mapStateToProps, mapDispatchToProps)(GetStarted)
