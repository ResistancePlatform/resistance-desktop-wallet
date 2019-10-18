// @flow
import * as Joi from 'joi'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { translate } from 'react-i18next'
import cn from 'classnames'

import { OwnAddressesState, OwnAddressesActions  } from '~/reducers/own-addresses/own-addresses.reducer'
import {
  RoundedForm,
  RoundedButton,
  RoundedInputWithPaste,
} from '~/components/rounded-form'

import styles from './ImportPrivateKeyModal.scss'

const getValidationSchema = t => Joi.object().keys({
  privateKey: Joi.string().required().label(t(`Recipient address`)),
})

type Props = {
  t: any,
  ownAddresses: OwnAddressesState,
  actions: object
}

/**
 * @class ImportPrivateKeyModal
 * @extends {Component<Props>}
 */
class ImportPrivateKeyModal extends Component<Props> {
	props: Props

	render() {
    const { t } = this.props
    const { isInProgress } = this.props.ownAddresses.importPrivateKeyModal

    return (
      <div className={styles.overlay}>
        <div className={cn(styles.container, styles.importPrivateKey)}>
          <div
            role="button"
            tabIndex={0}
            className={cn('icon', styles.closeButton)}
            onClick={this.props.actions.closeImportPrivateKeyModal}
            onKeyDown={() => false}
          />

          {/* Title */}
          <div className={styles.title}>
            {t(`Import private key`)}
          </div>

          <RoundedForm
            id="ownAddressesImportPrivateKeyModal"
            schema={getValidationSchema(t)}
            options={{stripUnknown: true}}
            clearOnUnmount
          >

          <RoundedInputWithPaste
            name="privateKey"
            label={t(`Private key`)}
          />

          <RoundedButton
            type="submit"
            className={styles.rightButton}
            onClick={this.props.actions.importPrivateKey}
            spinner={isInProgress}
            disabled={isInProgress}
            important
          >
            {t(`Import`)}
          </RoundedButton>

        </RoundedForm>
      </div>
    </div>
    )
  }
}

const mapStateToProps = state => ({
	ownAddresses: state.ownAddresses,
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(OwnAddressesActions, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(translate('own-addresses')(ImportPrivateKeyModal))
