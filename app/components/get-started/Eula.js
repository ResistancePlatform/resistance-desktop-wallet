// @flow
import React, { Component } from 'react'
import { RoundedButton } from '~/components/rounded-form'
import cn from 'classnames'

import HLayout from '~/assets/styles/h-box-layout.scss'
import VLayout from '~/assets/styles/v-box-layout.scss'
import styles from './Eula.scss'

type Props = {
  t: any,
  actions: object
}

/**
 * @class Eula
 * @extends {Component<Props>}
 */
export class Eula extends Component<Props> {
	props: Props

	/**
	 * @returns
   * @memberof Eula
	 */
	render() {
    const { t } = this.props

		return (
      <div className={cn(HLayout.hBoxChild, VLayout.vBoxContainer, styles.getStartedContainer)}>
        <div className={styles.title}>{t(`Terms & Conditions`)}</div>

        <div className={styles.hint}>{t(`Please agree to continue`)}</div>

        <div className={styles.eula}>
          <div className={styles.content}>
            Access to the website, desktop application, and participation in the token sale is strictly restricted to persons who are not U.S. citizens and who are located outside of the U.S., pursuant to Regulation S under the U.S. Securities Act of 1933, as amended (the &ldquo;Securities Act&rdquo;). Nothing in this website, desktop application, or token sale shall be deemed to constitute an offer, offer to sell, or the solicitation of an offer to buy, any securities in any U.S. jurisdiction.  Each person accessing this web site will be deemed to have understood and agreed that: (1) he is not a U.S. citizen and he is located outside of the U.S; (2) any securities described herein have not been and will not be registered under the Securities Act or with any securities regulatory authority of any state, and may not be transferred to any U.S. citizen unless the securities are registered under the Securities Act, or an exemption from the registration requirements of the Securities Act is available.  If you accept the foregoing terms and the Terms of Use for this website, please proceed. Otherwise, please leave immediately.  As defined Regulation S under the Securities Act, the term &ldquo;U.S person&rdquo; means: (1) any natural person resident in the United States; (2) any partnership or corporation organized or incorporated under the laws of the United States; (3) any state of which any executor or administrator is a U.S. person; (4) any trust of which any trustee is a U.S. person; (5) any agency or branch of a foreign entity located in the United States; (6) any non-discretionary account or similar account (other than an estate or trust) held by a dealer or other fiduciary for the benefit or account of a U.S. person;(7) any discretionary account or similar account (other than an estate or trust) held by a dealer or other fiduciary organized, incorporated, or (if an individual) resident in the United States; and (8) any partnership or corporation if: (A)organized or incorporated under the laws of any foreign jurisdiction; and (B) formed by a U.S. person principally  for the purpose of investing in securities not registered under the Securities Act, unless it is organized or incorporated, and owned, by accredited investors (as defined in Rule 501(a) of the Securities Act) who are not natural persons, estates or trusts.
          </div>
        </div>

        <div className={styles.buttons}>
          <RoundedButton onClick={this.props.actions.rejectEula}>
            {t(`Disagree`)}
          </RoundedButton>

          <RoundedButton
            onClick={this.props.actions.acceptEula}
            important>
            {t(`Agree`)}
          </RoundedButton>
        </div>

      </div>
    )
  }
}
