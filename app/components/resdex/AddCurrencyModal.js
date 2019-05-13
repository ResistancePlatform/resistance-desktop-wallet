// @flow
import * as Joi from 'joi'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { translate } from 'react-i18next'
import cn from 'classnames'
import log from 'electron-log'

import { ResDexState } from '~/reducers/resdex/resdex.reducer'
import {
  RoundedForm,
  RoundedButton,
  ToggleButton,
  RoundedInput,
  ChooseCurrencyInput
} from '~/components/rounded-form'
import { ResDexAccountsActions } from '~/reducers/resdex/accounts/reducer'

import styles from './AddCurrencyModal.scss'


const getValidationSchema = t => Joi.object().keys({
  symbol: Joi.string().required().label(t(`Coin`)),
  useElectrum: Joi.boolean().required(),
  rpcPort: Joi.number().min(1).max(65535).optional().label(t(`RPC port`)),
})

type Props = {
  t: any,
  form: object,
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

    const { enabledCurrencies } = this.props.accounts
    const { defaultValues, isInEditMode } = this.props.accounts.addCurrencyModal

    const { fields } = this.props.form || {}

    const isUseElectrumEnabled = (
      fields && fields.useElectrum !== undefined
      ? fields.useElectrum
      : defaultValues.useElectrum
    )

    log.info(`isElectrum`, isUseElectrumEnabled, fields)

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
          id="resDexAccountsAddCurrencyModal"
          schema={getValidationSchema(t)}
          clearOnUnmount
        >
          <ChooseCurrencyInput
            name="symbol"
            defaultValue={defaultValues.symbol}
            label={t(`Coin`)}
            excludeSymbols={enabledCurrencies.map(currency => currency.symbol)}
            disabled={isInEditMode}
          />

          <div className={styles.toggleContainer}>
            <div className={cn(styles.label, {[styles.active]: !isUseElectrumEnabled})}>{t(`Native`)}</div>

            <ToggleButton
              name="useElectrum"
              defaultValue={defaultValues.useElectrum}
            />

            <div className={cn(styles.label, {[styles.active]: isUseElectrumEnabled})}>{t(`Electrum`)}</div>
          </div>

          <RoundedInput
            name="rpcPort"
            defaultValue={defaultValues.rpcPort}
            type="number"
            label={t(`RPC port`)}
            disabled={isUseElectrumEnabled}
          />

          <hr />

          <div className={styles.memo}>
            <strong>{t(`Memo:`)}</strong>&nbsp;
            {t(`In order to use Native mode you must have the blockchain for this coin downloaded, synced and running.`)}
          </div>

          {isInEditMode ? (
            <div className={styles.buttonsRow}>
              <RoundedButton className={styles.button} type="submit" onClick={this.props.actions.updateCurrency} important>
                {t(`Save`)}
              </RoundedButton>
              <RoundedButton className={styles.button} onClick={this.props.actions.closeAddCurrencyModal}>
                {t(`Cancel`)}
              </RoundedButton>
            </div>
          ) : (
            <RoundedButton className={styles.button} type="submit" onClick={this.props.actions.addCurrency} important >
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
	accounts: state.resDex.accounts,
  form: state.roundedForm.resDexAccountsAddCurrencyModal
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(ResDexAccountsActions, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(translate('resdex')(AddCurrencyModal))
