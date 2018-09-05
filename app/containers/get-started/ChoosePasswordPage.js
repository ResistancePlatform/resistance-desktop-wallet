// @flow
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

import { GetStartedActions } from '~/state/reducers/get-started/get-started.reducer'
import { ChoosePassword } from '~/components/get-started/ChoosePassword'

const mapStateToProps = state => ({
	choosePassword: state.getStarted.choosePassword,
  form: state.roundedForm.getStartedChoosePassword
})

export default connect(mapStateToProps, null)(ChoosePassword)

