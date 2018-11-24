// @flow
import React, { Component } from 'react'
import cn from 'classnames'

import simplexLogo from '~/assets/images/simplex-logo.png'
import visaLogo from '~/assets/images/visa-logo.svg'
import mastercardLogo from '~/assets/images/mastercard-logo.svg'

import HLayout from '~/assets/styles/h-box-layout.scss'
import VLayout from '~/assets/styles/v-box-layout.scss'
import styles from './Simplex.scss'

type Props = {
  t: any
}


/**
 * @class Simplex
 * @extends {Component<Props>}
 */
export class Simplex extends Component<Props> {
	props: Props

	/**
	 * @returns
   * @memberof Simplex
	 */
	render() {
    const { t } = this.props

    return (
      <div className={cn(styles.container, HLayout.hBoxChild, VLayout.vBoxContainer)}>
        <div className={styles.header}>
          <div className={styles.buyBitcoin}>
            {t(`Buy Bitcoin with credit card`)}
          </div>

          <hr />

          <div className={styles.poweredBy}>
            {t(`Powered by`)}
            <img className={styles.simplex} src={simplexLogo} alt="Simplex" />
          </div>

          <div className={styles.accepted}>
            {t(`Visa and Mastercard accepted here`)}

            <img className={styles.visa} src={visaLogo} alt="VISA" />
            <img className={styles.mastercard} src={mastercardLogo} alt="Mastercard" />
          </div>

        </div>

        <div className={cn(styles.formContainer)}>
          <ul className={styles.stages}>
            <li>{t(`Quote`)}</li>
            <li>{t(`Send to`)}</li>
            <li>{t(`Card payment`)}</li>
            <li>{t(`Finished`)}</li>
          </ul>
          <iframe title={t(`Payment form`)} src="https://payments.resistance.io/" />
        </div>

        <ul className={cn(styles.box, styles.specs)}>
          <li>
            <div className={styles.bullet}>1</div>
            <div className={styles.subject}>
              {t(`First transaction`)}
              <div className={styles.value}>
                {t(`from \${{from}} to \${{to}}`, {from: 50, to: 10000})}
              </div>
            </div>
          </li>
          <li>
            <div className={styles.bullet}>2</div>
            <div className={styles.subject}>
              {t(`Daily limit`)}
              <div className={styles.value}>
                {t(`up to \${{upTo}}`, {upTo: 20000})}
              </div>
            </div>
          </li>
          <li>
            <div className={styles.bullet}>3</div>
            <div className={styles.subject}>
              {t(`Monthly limit`)}
              <div className={styles.value}>
                {t(`up to \${{upTo}}`, {upTo: 50000})}
              </div>
            </div>
          </li>
        </ul>

      </div>
    )
  }
}

