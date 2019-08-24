// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import { translate } from 'react-i18next'
import cn from 'classnames'

import {
  RoundedButton,
} from '~/components/rounded-form'
import { Kyc } from '~/components/Kyc/Kyc'
import { ResDexKycActions } from '~/reducers/resdex/kyc/reducer'

import styles from './Kyc.scss'

const kycUrl = 'https://kvk0a65tl4.execute-api.us-east-1.amazonaws.com/api'
// const kycUrl = 'https://regtech.identitymind.store/viewform/vs33y/'

type Props = {
  t: any,
  actions: object,
  resDex: object
}

/**
 * @class ResDexKyc
 * @extends {Component<Props>}
 */
export class ResDexKyc extends Component<Props> {
	props: Props

	/**
	 * @returns
   * @memberof ResDexKyc
	 */
	render() {
    const { t } = this.props
    const { kyc } = this.props.resDex

    if (kyc.isRegistered) {
      return null
    }

    if (kyc.tid === null) {
      return (
        <Kyc
          url={kycUrl}
          submitCallback={data => this.props.actions.update(data.tid, data.email)}
        />
      )
    }

    return (
      <div className={styles.container}>
        <div className={styles.register}>
          <div className={cn(styles.centerVertically, styles.innerContainer)}>
            <div className={styles.title}>
              <div className={cn('icon', styles.check)} />
              {t(`Almost done!`)}
            </div>

            <div className={styles.note}>
              {t(`Your verification was successful, please register your verification ID with ResDEX.`)}
            </div>

            <div className={styles.buttons}>
              <RoundedButton
                className={styles.submit}
                onClick={() => this.props.actions.register(kyc.tid)}
                important
                disabled={kyc.isRegistering}
                spinner={kyc.isRegistering}
              >
                {t(`Register your verification`)}
              </RoundedButton>
            </div>

          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => ({
  resDex: state.resDex,
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(ResDexKycActions, dispatch),
})

export default connect(mapStateToProps, mapDispatchToProps)(translate('resdex')(ResDexKyc))
