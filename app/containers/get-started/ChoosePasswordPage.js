// @flow
import { connect } from 'react-redux'
import { ChoosePassword } from '~/components/get-started/ChoosePassword'

const mapStateToProps = state => ({
  getStarted: state.getStarted,
  form: state.roundedForm.getStartedChoosePassword
})

export default connect(mapStateToProps, null)(ChoosePassword)

