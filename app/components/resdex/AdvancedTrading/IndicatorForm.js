// @flow
import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { translate } from 'react-i18next'
import cn from 'classnames'

import {
  RoundedForm,
  RoundedButton,
  RoundedInput,
  CheckBox,
  ColorPicker,
} from '~/components/rounded-form'
import { RESDEX } from '~/constants/resdex'
import { ResDexState } from '~/reducers/resdex/resdex.reducer'
import { ResDexBuySellActions } from '~/reducers/resdex/buy-sell/reducer'

import styles from './IndicatorForm.scss'

type Props = {
  t: any,
  className?: string,
  indicatorKey: string,
  resDex: ResDexState,
  actions: object
}

/**
 * @class IndicatorForm
 * @extends {Component<Props>}
 */
class IndicatorForm extends Component<Props> {
	props: Props

  getFormBody() {
    const { t, indicatorKey } = this.props
    const { indicators } = this.props.resDex.buySell.tradingChart
    const indicator = indicators[indicatorKey]

    switch (indicatorKey) {
      case 'volume':
        return (
          <React.Fragment>
            <CheckBox
              name="isSmaEnabled"
              defaultValue={indicator.sma.isEnabled}
            >
              {t(`Enable SMA`)}
            </CheckBox>

            <RoundedInput
              name="smaPeriod"
              label={t(`SMA Period`)}
              type="number"
              min="2"
              max="1000"
              defaultValue={indicator.sma.period}
            />

            <ColorPicker
              name="smaColor"
              label={t(`SMA Stroke Color`)}
              defaultValue={indicator.colors.sma.stroke}
            />
          </React.Fragment>
        )
      default:
        return null
    }
  }

  render() {
    const { t, indicatorKey } = this.props

    const defaultIndicator = RESDEX.getAvailableIndicators(t).find(item => item.key === indicatorKey)
    const formId = `resDexBuySellIndicatorsModal-${indicatorKey}`

    return (
      <div className={cn(styles.form, this.props.className)}>
        <div className={styles.title}>{defaultIndicator.name}</div>
        <div className={styles.body}>
          <RoundedForm id={formId}>
            {this.getFormBody()}

            <div className={styles.buttonsRow}>
              <RoundedButton
                type="reset"
                small
              >
                {t(`Reset`)}
              </RoundedButton>

              <RoundedButton
                onClick={() => this.props.actions.cancelIndicatorEdition(indicatorKey)}
                small
              >
                {t(`Cancel`)}
              </RoundedButton>

              <RoundedButton
                onClick={() => this.props.actions.saveIndicator(indicatorKey)}
                small
                important
              >
                {t(`Apply`)}
              </RoundedButton>

            </div>
          </RoundedForm>

        </div>
      </div>
    )

  }

}

const mapStateToProps = (state) => ({
  form: state.roundedForm.resDexBuySell,
	resDex: state.resDex,
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(ResDexBuySellActions, dispatch),
})

export default connect(mapStateToProps, mapDispatchToProps)(translate('resdex')(IndicatorForm))
