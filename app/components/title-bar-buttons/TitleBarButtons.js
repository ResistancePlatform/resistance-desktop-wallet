// @flow
import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import cn from 'classnames'

// TODO: move from Navi actions to here #114
import { NaviActions } from '~/reducers/navi/navi.reducer'
import styles from './TitleBarButtons.scss'

type Props = {
  navi: Object
}

export const DragBar = () => (
  <div className={styles.dragBar} />
)

class TitleBarButtons extends Component<Props> {
	props: Props

	render() {
		return (
      <div className={styles.container}>
        <div
          role="button"
          tabIndex={0}
          className={cn(styles.button, styles.close)}
          onClick={this.props.navi.mainWindowClose}
          onKeyDown={this.props.navi.mainWindowClose}
        />
        <div
          role="button"
          tabIndex={1}
          className={cn(styles.button, styles.minimize)}
          onClick={this.props.navi.mainWindowMinimize}
          onKeyDown={this.props.navi.mainWindowMinimize}
        />
        <div
          role="button"
          tabIndex={2}
          className={cn(styles.button, styles.maximize)}
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
