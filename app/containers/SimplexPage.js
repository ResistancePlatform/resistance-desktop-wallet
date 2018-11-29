// @flow
import { connect } from 'react-redux'
// import { bindActionCreators } from 'redux'
import { Simplex } from '~/components/simplex/Simplex'
import { translate } from 'react-i18next'

// const mapStateToProps = state => ({
//   resDex: state.resDex
// })
//
// const mapDispatchToProps = dispatch => ({
//   actions: bindActionCreators(ResDexActions, dispatch),
//   ordersActions: bindActionCreators(ResDexOrdersActions, dispatch),
// })

export default connect(null, null)(translate('other')(Simplex))
