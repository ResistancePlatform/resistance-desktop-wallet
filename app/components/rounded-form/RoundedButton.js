import React from 'react'
import cn from 'classnames'

import { translate } from '~/i18next.config'
import GenericControl, { GenericProps } from './GenericControl'

import animatedSpinner from '~/assets/images/animated-spinner.svg'
import styles from './RoundedButton.scss'


const t = translate('resdex')

export type Props = {
  ...GenericProps,
  type?: string,
  onClick?: () => boolean,
  important?: boolean,
  spinner?: boolean,
  spinnerTooltip?: string,
  disabled?: boolean
}

export default class RoundedButton extends GenericControl {
  props: Props

  static get displayName() { return 'RoundedButton' }

  onClickHandler(event) {
    event.stopPropagation()
    if (this.props.onClick) {
      this.props.onClick(event)
    }
    return false
  }

  renderControl() {
    return (
      // eslint-disable-next-line react/button-has-type
      <button
        type={this.props.type || 'button'}
        className={cn(styles.button, this.props.className, {
          [styles.important]: this.props.important,
          [styles.large]: this.props.large
        })}
        onClick={e => this.onClickHandler(e)}
        onKeyDown={e => [13, 32].includes(e.keyCode) ? this.onClickHandler(e) : false}
        disabled={this.props.disabled}
      >
        {this.props.spinner &&
          <img
            className={styles.spinner}
            src={animatedSpinner}
            alt={t(`Loading`)}
            title={this.props.spinnerTooltip}
          />
        }
        {this.props.children && this.props.children}
      </button>
    )
  }
}
