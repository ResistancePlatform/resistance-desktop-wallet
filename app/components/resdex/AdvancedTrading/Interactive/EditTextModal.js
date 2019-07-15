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
  RoundedInput,
} from '~/components/rounded-form'
import { ResDexBuySellActions } from '~/reducers/resdex/buy-sell/reducer'

import styles from './EditTextModal.scss'

const getValidationSchema = t => Joi.object().keys({
  text: Joi.string().required().label(t(`Text`)),
})

type Props = {
  t: any,
  buySell: ResDexState.buySell,
  actions: object
}

/**
 * @class EditTextModal
 * @extends {Component<Props>}
 */
class EditTextModal extends Component<Props> {
	props: Props

  onSubmit() {
    const { submitCallback } = this.props.buySell.editTextModal
    const { form } = this.props

    if (!form || !form.fields) {
      return
    }

    submitCallback(form.fields.text)
  }

	render() {
    const { t } = this.props

    const { editTextModal } = this.props.buySell

    return (
      <div className={styles.overlay}>
        <div className={cn(styles.container, styles.editText)}>
          <div
            role="button"
            tabIndex={0}
            className={cn('icon', styles.closeButton)}
            onClick={this.props.actions.closeEditTextModal}
            onKeyDown={() => {}}
          />

        {/* Title */}
        <div className={styles.title}>
          {editTextModal.defaultText}
        </div>

        <RoundedForm
          id="resDexBuySellEditTextModal"
          schema={getValidationSchema(t)}
          clearOnUnmount
        >
          <RoundedInput
            name="text"
            defaultValue={editTextModal.defaultText}
            label={t(`Text`)}
          />

          <div className={styles.buttonsRow}>
            <RoundedButton className={styles.button} onClick={this.props.actions.closeEditTextModal}>
              {t(`Cancel`)}
            </RoundedButton>

            <RoundedButton className={styles.button} type="submit" onClick={this.onSubmit} important>
              {t(`Save`)}
            </RoundedButton>

          </div>

        </RoundedForm>
    </div>
    </div>
    )
  }
}

const mapStateToProps = state => ({
  form: state.roundedForm.resDexBuySellEditTextModal,
	buySell: state.resDex.buySell
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(ResDexBuySellActions, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(translate('resdex')(EditTextModal))

