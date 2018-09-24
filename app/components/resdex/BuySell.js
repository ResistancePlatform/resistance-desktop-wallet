// @flow
import * as Joi from 'joi'
import React, { Component } from 'react'
import cn from 'classnames'
import { translate } from 'react-i18next'

import RoundedForm from '~/components/rounded-form/RoundedForm'
import RoundedInput from '~/components/rounded-form/RoundedInput'

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

		return (
      <div className={cn(styles.container)}>
        <div className={styles.actionContainer}>
          <RoundedForm
              id="resDexBuySell"
              schema={validationSchema}
          >
            <RoundedInput
              name="sellFrom"
              label={t(`Sell from`)}
              number
            />

            <RoundedInput
              name="depositTo"
              label={t(`Deposit to`)}
              number
            />

            {t(`Max. amount`)}
            <RoundedInput name="maxAmount" label="No" />

            {t(`Exchange rate`)}
            <RoundedInput name="exchangeRate" label="No"/>

            <label htmlFor="enhancedPrivacyInputId">
              <input id="enhancedPrivacyInputId" type="checkbox" name="enhancedPrivacy" />
              {t(`Enhanced privacy`)}
            </label>

            {t(`enhancend-privacy`)}

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
              <img src="assets/images/resdex/BTC.svg" alt="Bitcoin"/>
              <div>
                <span>Sell from</span>
                BTC Wallet
              </div>
            </div>

            <div className={styles.wallet}>
              <img src="assets/images/resdex/ETH.svg" alt="Ethereum"/>
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
