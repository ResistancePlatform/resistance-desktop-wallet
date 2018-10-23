// @flow
import { v4 as uuid } from 'uuid'
import cn from 'classnames'
import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import { getCurrencyName } from '~/utils/resdex'
import { PopupMenuActions } from '~/reducers/popup-menu/popup-menu.reducer'
import { PopupMenu, PopupMenuItem } from '~/components/popup-menu'
import CurrencyIcon from '~/components/resdex/CurrencyIcon'
import RoundedInput, { RoundedInputProps } from './NewRoundedInput'

import styles from './ChooseCurrencyInput.scss'


export type ChooseCurrencyInputProps = {
  ...RoundedInputProps,
  symbols: string[],
  popupMenu: object
}

class ChooseCurrencyInput extends RoundedInput {
  props: ChooseCurrencyInputProps
  popupMenuId: string

	constructor(props) {
		super(props)
    this.popupMenuId = `popup-menu-${uuid()}`
    this.state.value = props.defaultValue || 'RES'
	}

  renderInput() {
    return (
      <div className={styles.currency}>
        <CurrencyIcon className={styles.icon} symbol={this.state.value} size="1.1rem" />
        <div className={styles.name}>{getCurrencyName(this.state.value)}</div>


      </div>
    )
  }

  renderAddon() {
    const sortedSymbols = [...this.props.symbols].sort()

    return (
      <div className={styles.button}>
        <div
          className={cn('icon', styles.arrowDownIcon)}
          role="button"
          tabIndex={0}
          onClick={() => this.props.popupMenu.show(this.popupMenuId) && false }
          onKeyDown={() => false}
        />

        <PopupMenu id={this.popupMenuId} className={styles.menu} relative>
          { sortedSymbols.map(symbol => (
            <PopupMenuItem
              key={symbol}
              className={styles.menuItem}
              onClick={() => this.changeValue(symbol)}
            >
              <CurrencyIcon className={styles.icon} symbol={symbol} size="1rem" />
              <div className={styles.name}>{getCurrencyName(symbol)}</div>
            </PopupMenuItem>
          ))}
        </PopupMenu>
      </div>
    )
  }
}

const mapDispatchToProps = dispatch => ({
  popupMenu: bindActionCreators(PopupMenuActions, dispatch)
})

export default connect(null, mapDispatchToProps)(ChooseCurrencyInput)
