// @flow
import { Decimal } from 'decimal.js'
import * as Joi from 'joi'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import cn from 'classnames'
import { translate } from 'react-i18next'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'

import { RESDEX } from '~/constants/resdex'
import { truncateAmount, toDecimalPlaces } from '~/utils/decimal'
import RpcPolling from '~/components/rpc-polling/rpc-polling'
import { ResDexBuySellActions } from '~/reducers/resdex/buy-sell/reducer'
import { ResDexState } from '~/reducers/resdex/resdex.reducer'
import RoundedForm from '~/components/rounded-form/RoundedForm'
import RoundedInput from '~/components/rounded-form/RoundedInput'
import ChooseWallet from '~/components/rounded-form/ChooseWallet'
import CurrencyIcon from './CurrencyIcon'

import styles from './BuySell.scss'

const validationSchema = Joi.object().keys({
  sendFrom: Joi.string().required().label(`Send from`),
  receiveTo: Joi.string().required().label(`Receive to`),
  maxRel: Joi.number().required().label(`Max. amount`),
})

type Props = {
  t: any,
  roundedForm: object,
  accounts: ResDexState.accounts,
  buySell: ResDexState.buySell,
  actions: object
}


/**
 * @class ResDexBuySell
 * @extends {Component<Props>}
 */
class ResDexBuySell extends Component<Props> {
	props: Props

  getBaseAmount(): Decimal | null {
    const { orderBook } = this.props.buySell
    const form = this.props.roundedForm.resDexBuySell

    if (!orderBook.asks.length || !form || !form.fields) {
      return null
    }

    const { price } = orderBook.asks[0]
    const baseAmount = Decimal(form.fields.maxRel || '0').div(price)

    return baseAmount
  }

  getMaxPayoutCaption(): string {
    const { baseCurrency } = this.props.buySell
    let baseAmount = this.getBaseAmount()

    if (baseAmount === null) {
      return `0 ${baseCurrency}`
    }

    const fee = RESDEX.dexFee.add(RESDEX.resFee).div(Decimal('100'))
    baseAmount = baseAmount.sub(baseAmount.mul(fee))

    return `${toDecimalPlaces(baseAmount)} ${baseCurrency}`
  }

  getAtCaption(t) {
    const baseAmount = this.getBaseAmount()

    if (baseAmount === null) {
      return t(`No liquidity available yet`)
    }

    const { baseCurrency, quoteCurrency } = this.props.buySell

    return t(`@ {{baseAmount}} {{baseCurrency}} per {{quoteCurrency}}`, {
      baseAmount: truncateAmount(baseAmount),
      baseCurrency,
      quoteCurrency
    })

  }

  getQuoteAmountCaption() {
    const form = this.props.roundedForm.resDexBuySell
    const amount = Decimal(form && form.fields.maxRel || '0')

    return toDecimalPlaces(amount)
  }

  // Can't create a market order if there's no liquidity or when sending an order
  getSubmitButtonDisabledAttribute() {
    const { baseCurrency, quoteCurrency, orderBook, isSendingOrder } = this.props.buySell

    return (
      isSendingOrder
      || orderBook.baseCurrency !== baseCurrency
      || orderBook.quoteCurrency !== quoteCurrency
      || orderBook.asks.length === 0
    )

  }

	/**
	 * @returns
   * @memberof ResDexBuySell
	 */
	render() {
    const { t } = this.props
    const { baseCurrency, quoteCurrency } = this.props.buySell

		return (
      <div className={cn(styles.container)}>
        <RpcPolling
          interval={1.0}
          actions={{
            polling: ResDexBuySellActions.getOrderBook,
            success: ResDexBuySellActions.gotOrderBook,
            failure: ResDexBuySellActions.getOrderBookFailed
          }}
        />

        <div className={styles.actionContainer}>
          <Tabs
            className={styles.tabs}
            selectedTabClassName={styles.selectedTab}
            selectedTabPanelClassName={styles.selectedTabPanel}
          >
            <TabList className={styles.tabList}>
              <Tab className={styles.tab}>{t(`Simple`)}</Tab>
              <Tab className={styles.tab} disabled>{t(`Advanced`)}</Tab>
            </TabList>

            <TabPanel className={styles.tabPanel}>
              <RoundedForm
                id="resDexBuySell"
                schema={validationSchema}
              >
                <ChooseWallet
                  name="sendFrom"
                  defaultValue={quoteCurrency}
                  label={t(`Send from`)}
                  onChange={this.props.actions.updateQuoteCurrency}
                  currencies={this.props.accounts.currencies}
                />

                <ChooseWallet
                  name="receiveTo"
                  defaultValue={baseCurrency}
                  label={t(`Receive to`)}
                  onChange={this.props.actions.updateBaseCurrency}
                  currencies={this.props.accounts.currencies}
                />

                <RoundedInput
                  className={styles.maxRel}
                  label={t(`Max. {{quoteCurrency}}`, { quoteCurrency })}
                  name="maxRel"
                  number />

                <div className={styles.enhancedPrivacy}>
                  <label htmlFor="enhancedPrivacyInputId">
                    <input id="enhancedPrivacyInputId" type="checkbox" name="enhancedPrivacy" />
                    {t(`Enhanced privacy`)}
                    <i className={styles.info} />
                  </label>
                </div>

                <button
                  type="submit"
                  onClick={this.props.actions.createMarketOrder}
                  disabled={this.getSubmitButtonDisabledAttribute()}
                >
                  {t(`Exchange`)}
                </button>
              </RoundedForm>
            </TabPanel>

            <TabPanel className={styles.tabPanel} />
          </Tabs>


        </div>

        <div className={styles.summaryContainer}>
          <div className={styles.briefContainer}>
            <div className={styles.brief}>{t(`You are sending`)}</div>

            <div className={styles.amount}>
              {this.getQuoteAmountCaption()}
              <span>{quoteCurrency}</span>
            </div>

            <div className={styles.at}>{this.getAtCaption(t)}</div>

          </div>

          <div className={styles.fromTo}>
            <div className={styles.wallet}>
              <CurrencyIcon symbol={quoteCurrency} size="1.24rem" />
              <div>
                <span>{t(`Send`)}</span>
                {t(`{{quoteCurrency}} Wallet`, { quoteCurrency })}
              </div>
            </div>

            <div className={cn('icon', styles.exchangeIcon)} />

            <div className={styles.wallet}>
              <CurrencyIcon symbol={baseCurrency} size="1.24rem" />
              <div>
                <span>{t(`Receive`)}</span>
                {t(`{{baseCurrency}} Wallet`, { baseCurrency })}
              </div>
            </div>

          </div>

          <ul className={styles.list}>
            <li className={cn({ [styles.res]: this.props.buySell.enhancedPrivacy })}>
              {this.getQuoteAmountCaption()}&nbsp;
              {quoteCurrency}
              <hr />
              <span>{this.getMaxPayoutCaption()}</span>
            </li>
            <li>
              {t(`DEX Fee`)}
              <hr />
              <span>{RESDEX.dexFee.toFixed(2)}%</span>
            </li>
            <li>
              {t(`RES Fee`)}
              <hr />
              <span>{RESDEX.resFee.toFixed(2)}%</span>
            </li>
            <li>
              {t(`Max. Total Payout`)}
              <hr />
              <span>{this.getMaxPayoutCaption()}</span>
            </li>
          </ul>

        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
	roundedForm: state.roundedForm,
	buySell: state.resDex.buySell,
	accounts: state.resDex.accounts,
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(ResDexBuySellActions, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(translate('resdex')(ResDexBuySell))
