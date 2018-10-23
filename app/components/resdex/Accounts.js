// @flow
import moment from 'moment'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { translate } from 'react-i18next'
import cn from 'classnames'

import { getCurrencyName } from '~/utils/resdex'
import { toDecimalPlaces } from '~/utils/decimal'
import { PopupMenuActions } from '~/reducers/popup-menu/popup-menu.reducer'
import { PopupMenu, PopupMenuItem } from '~/components/popup-menu'
import CurrencyIcon from './CurrencyIcon'
import { ResDexState } from '~/reducers/resdex/resdex.reducer'
import { ResDexAccountsActions } from '~/reducers/resdex/accounts/reducer'

import styles from './Accounts.scss'


const enabledCurrencyPopupMenuId = 'resdex-accounts-enabled-currencies-popup-menu-id'

type Props = {
  t: any,
  i18n: any,
  assets: ResDexState.assets,
  accounts: ResDexState.accounts,
  actions: object,
  popupMenuActions: object
}


/**
 * @class ResDexAccounts
 * @extends {Component<Props>}
 */
class ResDexAccounts extends Component<Props> {
	props: Props
  currencyColors: { [string]: string }

  constructor(props) {
    super(props)
    this.currencyColors = {}
  }

  currencyIconRef(symbol: string, element: any) {
    if (!element) {
      return
    }

    const [circleElement] = element.getElementsByTagName('circle')

    if (circleElement) {
      this.currencyColors[symbol] = circleElement.getAttribute('fill')
    }
  }

  getEnabledCurrencyContents(t, symbol: string) {
    const currency = this.props.accounts.currencies[symbol]
    const { selectedSymbol } = this.props.accounts
    const { currencyHistory } = this.props.assets
    const hourHistory = currencyHistory.hour && currencyHistory.hour[symbol]
    const price = hourHistory && hourHistory.slice(-1)[0].value

    const showPopupMenu = e => {
      e.preventDefault()
      e.stopPropagation()
      this.props.popupMenuActions.show(enabledCurrencyPopupMenuId, symbol, e.clientY, e.clientX)
      return false
    }

    return (
      <div
        role="none"
        key={symbol}
        className={cn(styles.record, { [styles.selected]: selectedSymbol === symbol })}
        onClick={() => this.props.actions.selectCurrency(symbol)}
      >
        <div className={styles.columnsWrapper}>
          <div className={styles.currency}>
            <CurrencyIcon imageRef={(s, el) => this.currencyIconRef(s, el)} symbol={symbol} size="1.3rem" />
          </div>

          <div className={styles.balance}>
            <span>{getCurrencyName(symbol)}</span>
            {currency ? `${currency.balance} ${symbol}` : t(`N/A`)}
          </div>

          <div className={styles.equity}>
            <i>$</i>{currency && price ? toDecimalPlaces(price.mul(currency.balance), 2) : t(`N/A`)}
          </div>

          <div className={styles.more}>
            <span
              role="none"
              className={styles.button}
              onClick={showPopupMenu}
              onContextMenu={showPopupMenu}
            />

            <PopupMenu id={enabledCurrencyPopupMenuId}>
              <PopupMenuItem onClick={(e, clickedSymbol) => this.props.actions.showDepositModal(clickedSymbol)}>
                {t(`Deposit`)}
              </PopupMenuItem>
              <PopupMenuItem onClick={(e, clickedSymbol) => this.props.actions.showWithdrawModal(clickedSymbol)}>
                {t(`Withdraw`)}
              </PopupMenuItem>
              <PopupMenuItem onClick={(e, clickedSymbol) => this.props.actions.copySmartAddress(clickedSymbol)}>
                {t(`Copy smart address`)}
              </PopupMenuItem>
              <PopupMenuItem onClick={(e, clickedSymbol) => this.props.actions.showEditCurrencyModal(clickedSymbol)}>
                {t(`Edit coin`)}
              </PopupMenuItem>
              <PopupMenuItem
                className={styles.deleteCoin}
                onClick={(e, clickedSymbol) => this.props.actions.deleteCurrency(clickedSymbol)}
              >
                {t(`Delete coin`)}
              </PopupMenuItem>
            </PopupMenu>

          </div>

        </div>

        <div className={styles.rateBar}>
          <div className={styles.btc} style={{ width: `77%`, background: this.currencyColors[symbol] || '#9a6de8' }} />
        </div>

      </div>
    )
  }

  getTransactionContents(transaction) {
    const { t, i18n } = this.props
    const { selectedSymbol } = this.props.accounts
    const { currencyHistory } = this.props.assets

    const time = moment(transaction.time).locale(i18n.language)
    const currencyName = getCurrencyName(selectedSymbol)

    const hourHistory = currencyHistory.hour && currencyHistory.hour[selectedSymbol]
    const price = hourHistory && hourHistory.slice(-1)[0].value

    return (
      <div className={styles.record} key={transaction.txid}>
        <div className={styles.date}>
          <span>{time.format('MMM')}</span>
          {time.format('D')}
        </div>

        <div className={styles.description}>
          <span>{t(`Sent {{name}}`, { name: currencyName})}</span>
          {t(`To {{name}} address`, { name: currencyName})}
        </div>

        <div className={styles.amount}>
          <span>{toDecimalPlaces(transaction.amount)} {selectedSymbol}</span>
          ${price ? toDecimalPlaces(price.mul(transaction.amount), 2) : t(`N/A`)}
        </div>

      </div>
    )
  }

	/**
	 * @returns
   * @memberof ResDexAccounts
	 */
	render() {
    const { t } = this.props
    const { selectedSymbol, transactions: transactionsMap } = this.props.accounts
    const { enabledCurrencies } = this.props.accounts
    const transactions = transactionsMap[selectedSymbol] || []

		return (
      <div className={cn(styles.container)}>
        <div className={styles.enabledCurrenciesContainer}>
          {enabledCurrencies.map(currency => this.getEnabledCurrencyContents(t, currency.symbol))}

          <div
            role="button"
            tabIndex={enabledCurrencies.length}
            className={styles.addNewCoin}
            onClick={this.props.actions.showAddCurrencyModal}
            onKeyDown={() => false}
          >
            <div className={cn('icon', styles.button)} />
            <div className={styles.caption}>{t(`Add new coin`)}</div>
          </div>

        </div>

        <div className={styles.historyContainer}>
          {transactions.map(transaction => this.getTransactionContents(transaction))}

          {!transactions.length &&
            <div className={styles.empty}>
              {t(`You have no transaction history for {{currency}} yet`, { currency: getCurrencyName(selectedSymbol) })}
            </div>
          }
        </div>
      </div>
    )
  }
}


const mapStateToProps = state => ({
	assets: state.resDex.assets,
  accounts: state.resDex.accounts
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(ResDexAccountsActions, dispatch),
  popupMenuActions: bindActionCreators(PopupMenuActions, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(translate('resdex')(ResDexAccounts))
