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
          {t(`You are selling`)}

          {t(`DEX Fee`)}
          {t(`RES Fee`)}
          {t(`Max. Total Payout`)}
        </div>
      </div>
    )
  }
}

export default translate('resdex')(ResDexBuySell)
