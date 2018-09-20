// @flow
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { ResDex } from '~/components/resdex/ResDex'
import { ResDexActions } from '~/state/reducers/resdex/resdex.reducer'
import { translate } from 'react-i18next'

const mapStateToProps = state => ({
  resdex: state.resdex
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(ResDexActions, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(translate('resdex')(ResDex))
