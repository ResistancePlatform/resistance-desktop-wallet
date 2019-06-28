// @flow
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { ResDex } from '~/components/resdex/ResDex'
import { ResDexActions } from '~/reducers/resdex/resdex.reducer'
import { ResDexOrdersActions } from '~/reducers/resdex/orders/reducer'
import { ResDexLoginActions } from '~/reducers/resdex/login/reducer'
import { translate } from 'react-i18next'

const mapStateToProps = state => ({
  settings: state.settings,
  resDex: state.resDex,
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(ResDexActions, dispatch),
  ordersActions: bindActionCreators(ResDexOrdersActions, dispatch),
  loginActions: bindActionCreators(ResDexLoginActions, dispatch),
})

export default connect(mapStateToProps, mapDispatchToProps)(translate('resdex')(ResDex))
