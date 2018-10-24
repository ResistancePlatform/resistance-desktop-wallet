// @flow
import * as Joi from 'joi'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { translate } from 'react-i18next'
import cn from 'classnames'

import { ResDexState } from '~/reducers/resdex/resdex.reducer'
import {
  RoundedForm,
  RoundedButton,
  ToggleButton,
  RoundedInput,
  ChooseCurrencyInput
} from '~/components/rounded-form'
import { ResDexAccountsActions } from '~/reducers/resdex/accounts/reducer'

import styles from './Modal.scss'


const getValidationSchema = t => Joi.object().keys({
  recipientAddress: Joi.string().required().label(t(`Recipient address`)),
  withdrawFrom: Joi.string().required(),
  amount: Joi.number().required().label(t(`Amount`)),
  equity: Joi.number(),
  note: Joi.string().optional().label(t(`Note`)),
})

type Props = {
  t: any,
  accounts: ResDexState.accounts,
  actions: object
}

/**
 * @class AddCurrencyModal
 * @extends {Component<Props>}
 */
class AddCurrencyModal extends Component<Props> {
	props: Props

	render() {
    const { t } = this.props

    const { enabledCurrencies, addCurrencyModal } = this.props.accounts
    const { isInEditMode, symbol } = addCurrencyModal

    const { useElectrum } = true

    // const { address } = this.props.accounts.currencies[symbol]

    return (
      <div className={styles.overlay}>
        <div className={cn(styles.container, styles.addCurrency)}>
          <div
            role="button"
            tabIndex={0}
            className={cn('icon', styles.closeButton)}
            onClick={this.props.actions.closeAddCurrencyModal}
            onKeyDown={() => {}}
          />

        <div className={styles.title}>
          {isInEditMode ? t(`Edit coin`) : t(`Add new coin`)}
        </div>

        <RoundedForm
          id="addressBookNewAddressDialog"
          schema={getValidationSchema(t)}
        >
          <ChooseCurrencyInput
            name="symbol"
            defaultValue={symbol}
            label={t(`Coin`)}
            symbols={enabledCurrencies.map(currency => currency.symbol)}
            disabled={isInEditMode}
          />

          <div className={styles.toggleContainer}>
            <div className={cn(styles.label, {[styles.active]: !useElectrum})}>{t(`Native`)}</div>

            <ToggleButton
              name="useElectrum"
              defaultValue
            />

            <div className={cn(styles.label, {[styles.active]: useElectrum})}>{t(`Electrum`)}</div>
          </div>

          <RoundedInput
            name="rpcPort"
            defaultValue=""
            type="number"
            label={t(`RPC port`)}
          />

          <hr />

          <div className={styles.memo}>
            <strong>{t(`Memo:`)}</strong>&nbsp;
            {t(`In order to use Native mode you must have the blockchain for this coin downloaded, synced and running.`)}
          </div>

          {isInEditMode ? (
            <div className={styles.buttonsRow}>
              <RoundedButton type="submit" onClick={this.props.actions.updateCurrency} important>
                {t(`Save`)}
              </RoundedButton>
              <RoundedButton onClick={this.props.actions.closeAddCurrencyModal}>
                {t(`Cancel`)}
              </RoundedButton>
            </div>
          ) : (
            <RoundedButton type="submit" onClick={this.props.actions.addCurrency} important >
              {t(`Add coin`)}
            </RoundedButton>
          )}

        </RoundedForm>

      </div>
    </div>
    )
  }
}

const mapStateToProps = (state) => ({
	accounts: state.resDex.accounts
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(ResDexAccountsActions, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(translate('resdex')(AddCurrencyModal))
