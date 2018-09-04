// @flow
import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

// TODO: move from Navi actions to here #114
import { NaviActions } from '../../state/reducers/navi/navi.reducer'
import styles from './TitleBarButtons.scss'

type Props = {
  navi: Object
}

class TitleBarButtons extends Component<Props> {
	props: Props

	render() {
		return (
      <div className={[styles.titleBarButtonsContainer]}>
        <div
          className={styles.closeButton}
          onClick={this.props.navi.mainWindowClose}
          onKeyDown={this.props.navi.mainWindowClose}
        />
        <div
          className={styles.minimizeButton}
          onClick={this.props.navi.mainWindowMinimize}
          onKeyDown={this.props.navi.mainWindowMinimize}
        />
        <div
          className={styles.maximizeButton}
          onClick={this.props.navi.mainWindowMaximize}
          onKeyDown={this.props.navi.mainWindowMaximize}
        />
      </div>
		)
	}
}

const mapDispatchToProps = dispatch => ({
  navi: bindActionCreators(NaviActions, dispatch),
})

export default connect(null, mapDispatchToProps)(TitleBarButtons)