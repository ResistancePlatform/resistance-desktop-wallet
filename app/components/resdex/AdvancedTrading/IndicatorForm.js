// @flow
import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { translate } from 'react-i18next'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
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

import 'react-tabs/style/react-tabs.scss'
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

  getInputs(inputs) {
    const result = inputs.map(input => {
      switch (input.type) {
        case 'number':
          return (
            <RoundedInput
              name={input.name}
              label={input.label}
              labelClassName={styles.inputLabel}
              type="number"
              min={input.min || 2}
              max={input.max || 1000}
              defaultValue={input.value}
            />
          )
        case 'boolean':
          return (
            <CheckBox name={input.name} defaultValue={input.value}>
              {input.label}
            </CheckBox>
          )
        default:
          return null
      }
    })

    return result
  }

  getColors(colors) {
    const result = colors.map(color => (
      <ColorPicker
        name={color.name}
        label={color.label}
        labelClassName={styles.colorPickerLabel}
        defaultValue={color.value}
      />
    ))
    return result
  }

  getFormBody() {
    const { t, indicatorKey } = this.props
    const { indicators } = this.props.resDex.buySell.tradingChart
    const indicator = indicators[indicatorKey]

    const body = (
      <Tabs
        className={styles.tabs}
        selectedTabClassName={styles.selectedTab}
        selectedTabPanelClassName={styles.selectedTabPanel}
        style={{height: indicator.formHeight || '4rem'}}
      >
        <TabList className={styles.tabList}>
            <Tab className={styles.tab}>{t(`Inputs`)}</Tab>
            <Tab className={styles.tab}>{t(`Colors`)}</Tab>
        </TabList>
        <TabPanel className={styles.tabPanel}>
          {this.getInputs(indicator.inputs)}
        </TabPanel>
        <TabPanel className={styles.tabPanel}>
          {this.getColors(indicator.colors)}
        </TabPanel>
      </Tabs>
    )

    return body
  }

  render() {
    const { t, indicatorKey } = this.props

    const defaultIndicator = RESDEX.getAvailableIndicators(t).find(item => item.key === indicatorKey)
    const formId = `resDexBuySellIndicatorsModal-${indicatorKey}`

    return (
      <div className={cn(styles.form, this.props.className)}>
        <div className={styles.title}>{defaultIndicator.label}</div>
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
