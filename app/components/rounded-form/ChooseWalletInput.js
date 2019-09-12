// @flow
import React from 'react'
import { v4 as uuid } from 'uuid'
import cn from 'classnames'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import { toDecimalPlaces } from '~/utils/decimal'
import { translate } from '~/i18next.config'
import { PopupMenu, PopupMenuItem } from '~/components/popup-menu'
import { PopupMenuActions } from '~/reducers/popup-menu/popup-menu.reducer'
import CurrencyIcon from '~/components/resdex/CurrencyIcon'
import GenericInput, { GenericInputProps } from './GenericInput'

import styles from './ChooseWalletInput.scss'

const t = translate('resdex')

export type ChooseWalletInputProps = {
  ...GenericInputProps,
	name: string,
  currencies: { [string]: Currency },
  popupMenu: object
}

class ChooseWalletInput extends GenericInput {
	props: ChooseWalletInputProps
  popupMenuId: string

	/**
	 * @param {*} props
	 * @memberof ChooseWalletInput
	 */
	constructor(props) {
		super(props)
    this.popupMenuId = `popup-menu-${uuid()}`
    this.state = {
      value: props.defaultValue || 'RES',
    }
	}

  renderInput() {
    const selectedCurrency = this.props.currencies[this.state.value]

    if (!selectedCurrency) {
      return null
    }

    const displayBalance = selectedCurrency.balance.minus(selectedCurrency.lockedAmount)

    return (
      <div className={styles.chooseWallet}>
        <CurrencyIcon className={styles.currencyIcon} symbol={this.state.value} size="1.0rem" />

        <div className={styles.walletName}>{t(`{{symbol}} Wallet`, {symbol: this.state.value})}</div>

        <div className={styles.balance}>{selectedCurrency && toDecimalPlaces(displayBalance)}</div>

        <div className={styles.symbol}>{this.state.value}</div>

      </div>
    )
  }

  renderAddon() {
    const sortedCurrencies = Object.values(this.props.currencies).sort((item1, item2) => (
      item1.symbol.localeCompare(item2.symbol)
    ))

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
          { sortedCurrencies.map(currency => (
            <PopupMenuItem
              key={currency.symbol}
              className={styles.menuItem}
              onClick={() => this.changeValue(currency.symbol)}
            >
              <CurrencyIcon className={styles.icon} symbol={currency.symbol} size="1rem" />
              <div className={styles.walletName}>{currency.name}</div>
              <div className={styles.balance}>{toDecimalPlaces(currency.balance)}</div>
              <div className={styles.symbol}>{currency.symbol}</div>
            </PopupMenuItem>
          ))
          }
        </PopupMenu>
    </div>
    )
  }

}

const mapDispatchToProps = dispatch => ({
  popupMenu: bindActionCreators(PopupMenuActions, dispatch)
})

export default connect(null, mapDispatchToProps)(ChooseWalletInput)
