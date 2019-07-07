// @flow
import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { translate } from 'react-i18next'
import cn from 'classnames'
import log from 'electron-log'

import {
  RoundedForm,
  RoundedButton,
  RoundedInput,
  CheckBox,
} from '~/components/rounded-form'
import { RESDEX } from '~/constants/resdex'
import { ResDexState } from '~/reducers/resdex/resdex.reducer'
import { ResDexBuySellActions } from '~/reducers/resdex/buy-sell/reducer'

import styles from './IndicatorForm.scss'

type Props = {
  t: any,
  className?: string,
  indicatorKey: string,
  form: object,
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
            <RoundedInput
              name="emaPeriod"
              label={t(`Period`)}
              type="number"
            />

            <CheckBox name="isEmaEnabled">
              {t(`Enable EMA`)}
            </CheckBox>

          </React.Fragment>
        )
      default:
        return null
    }
  }

  render() {
    const { t, indicatorKey } = this.props

    const defaultIndicator = RESDEX.getAvailableIndicators(t).find(item => item.key === indicatorKey)

    return (
      <div className={cn(styles.form, this.props.className)}>
        <div className={styles.title}>{defaultIndicator.name}</div>
        <div className={styles.body}>
          <RoundedForm
            id={`resDexBuySellIndicatorsModal-${indicatorKey}`}
          >
            {this.getFormBody()}

            <div className={styles.buttonsRow}>
              <RoundedButton small>
                {t(`Reset`)}
              </RoundedButton>

              <RoundedButton small>
                {t(`Cancel`)}
              </RoundedButton>

              <RoundedButton small>
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
