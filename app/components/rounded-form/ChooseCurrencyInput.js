// @flow
import { v4 as uuid } from 'uuid'
import cn from 'classnames'
import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import { supportedCurrencies } from '~/constants/resdex/supported-currencies'
import { getCurrencyName } from '~/utils/resdex'
import { PopupMenuActions } from '~/reducers/popup-menu/popup-menu.reducer'
import { PopupMenu, PopupMenuItem } from '~/components/popup-menu'
import CurrencyIcon from '~/components/resdex/CurrencyIcon'
import GenericInput, { GenericInputProps } from './GenericInput'

import styles from './ChooseCurrencyInput.scss'


export type ChooseCurrencyInputProps = {
  ...GenericInputProps,
  excludeSymbols: string[],
  popupMenu: object
}

class ChooseCurrencyInput extends GenericInput {
  props: ChooseCurrencyInputProps
  symbols: string[]
  popupMenuId: string

	constructor(props) {
		super(props)
    this.popupMenuId = `popup-menu-${uuid()}`

    this.symbols = supportedCurrencies
      .map(currency => currency.coin)
      .filter(symbol => !props.excludeSymbols.includes(symbol))
      .sort()

    this.state.value = props.defaultValue || this.symbols.slice().shift()
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
          { this.symbols.map(symbol => (
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
