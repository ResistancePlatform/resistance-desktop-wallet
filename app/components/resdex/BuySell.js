// @flow
import { Decimal } from 'decimal.js'
import * as Joi from 'joi'
import React, { Component } from 'react'
import cn from 'classnames'
import { translate } from 'react-i18next'

import RoundedForm from '~/components/rounded-form/RoundedForm'
import RoundedInput, { ChooseWalletAddon } from '~/components/rounded-form/RoundedInput'
import CurrencyIcon from './CurrencyIcon'

import styles from './BuySell.scss'

const validationSchema = Joi.object().keys({
  name: Joi.string().required().label(`Name`),
  address: (
    Joi.string().required().label(`Address`)
  )
})

type Props = {
  t: any
}


/**
 * @class ResDexBuySell
 * @extends {Component<Props>}
 */
class ResDexBuySell extends Component<Props> {
	props: Props

	/**
	 * @returns
   * @memberof ResDexBuySell
	 */
	render() {
    const { t } = this.props

    const wallets = [{
      currency: 'BTC',
      balance: Decimal('2.12400181')
    }]

		return (
      <div className={cn(styles.container)}>
        <div className={styles.actionContainer}>
          <RoundedForm
              id="resDexBuySell"
              schema={validationSchema}
          >
            <RoundedInput
              name="sellFrom"
              labelClassName={styles.inputLabel}
              label={t(`Sell from`)}
              newAddon={new ChooseWalletAddon(wallets)}
              number
            />

            <RoundedInput
              name="depositTo"
              labelClassName={styles.inputLabel}
              label={t(`Deposit to`)}
              newAddon={new ChooseWalletAddon(wallets)}
              number
            />

            <div className={styles.inputsRow}>
              <div>
                <div className={styles.caption}>{t(`Max. amount`)}<i /></div>
                <RoundedInput className={styles.maxAmount} name="maxAmount" number />
              </div>

              <div>
                <div className={styles.caption}>{t(`Exchange rate`)}<i /></div>
                <RoundedInput name="exchangeRate" number />
              </div>

            </div>

            <div className={styles.enhancedPrivacy}>
              <label htmlFor="enhancedPrivacyInputId">
                <input id="enhancedPrivacyInputId" type="checkbox" name="enhancedPrivacy" />
                {t(`Enhanced privacy`)}
              </label>

              <strong>{t(`Read more:`)}</strong> {t(`enhanced-privacy`)}
            </div>

            <button type="submit">{t(`Sell {{name}}`, { name: 'Bitcoin' })}</button>
          </RoundedForm>
        </div>

        <div className={styles.summaryContainer}>
          <div className={styles.briefContainer}>
            <div className={styles.brief}>{t(`You are selling`)}</div>

            <div className={styles.amount}>
              1.01679 <span>BTC</span>
            </div>

            <div className={styles.at}>
              @ 24.69 ETH per BTC
            </div>

          </div>

          <div className={styles.fromTo}>
            <div className={styles.wallet}>
              <CurrencyIcon symbol="BTC" size="1.3rem" />
              <div>
                <span>Sell from</span>
                BTC Wallet
              </div>
            </div>

            <div className={styles.wallet}>
              <CurrencyIcon symbol="ETH" size="1.3rem" />
              <div>
                <span>Deposit to</span>
                ETH Wallet
              </div>
            </div>

          </div>

          <ul className={styles.list}>
            <li className={styles.res}>
              1.01679 BTC
              <hr />
              <span>24.69 ETH</span>
            </li>
            <li>
              {t(`DEX Fee`)}
              <hr />
              <span>0.15%</span>
            </li>
            <li>
              {t(`RES Fee`)}
              <hr />
              <span>0.10%</span>
            </li>
            <li>
              {t(`Max. Total Payout`)}
              <hr />
              <span>25.26 ETH</span>
            </li>
          </ul>

        </div>
      </div>
    )
  }
}

export default translate('resdex')(ResDexBuySell)
