// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { translate } from 'react-i18next'
import cn from 'classnames'
import log from 'electron-log'

import {
  RoundedInput,
  CheckBox,
} from '~/components/rounded-form'
import IndicatorForm from './IndicatorForm'
import { RESDEX } from '~/constants/resdex'
import { ResDexState } from '~/reducers/resdex/resdex.reducer'
import { ResDexBuySellActions } from '~/reducers/resdex/buy-sell/reducer'

import scrollStyles from '~/assets/styles/scrollbar.scss'
import styles from './IndicatorsModal.scss'

type Props = {
  t: any,
  resDex: ResDexState,
  actions: object
}

/**
 * @class IndicatorsModal
 * @extends {Component<Props>}
 */
class IndicatorsModal extends Component<Props> {
	props: Props

	/**
	 * @memberof IndicatorsModal
	 */
	componentDidMount() {
    this.props.actions.updateIndicatorsSearchString('')
  }

  getAvailableIndicators() {
    const { t } = this.props
    const { searchString } = this.props.resDex.buySell.indicatorsModal

    const indicators = RESDEX.getAvailableIndicators(t)
    indicators.sort((indicator1, indicator2) => indicator1.name.localeCompare(indicator2.name))

    log.debug(JSON.stringify(indicators))
    log.debug(JSON.stringify(this.props.resDex.buySell))
    return indicators.filter(indicator => indicator.name.toLowerCase().includes(searchString.toLowerCase()))
  }

	render() {
    const { t } = this.props
    const { indicatorsModal, tradingChart: chartSettings } = this.props.resDex.buySell

    const indicatorKeys = Object.keys(chartSettings.indicators).sort()
    const selectedIndicators = indicatorKeys.map(key => chartSettings.indicators[key])

    const availableIndicators = this.getAvailableIndicators()

    return (
      <div className={styles.overlay}>
        <div className={cn(styles.container, styles.indicators)}>
          <div
            role="button"
            tabIndex={0}
            className={cn('icon', styles.closeButton)}
            onClick={this.props.actions.closeIndicatorsModal}
            onKeyDown={() => {}}
          />

        {/* Title */}
        <div className={styles.title}>
          {t(`Analysis tools`)}
        </div>

        <div className={styles.body}>
          <div className={cn(styles.selectedContainer, scrollStyles.scrollbar)}>
            {Object.keys(chartSettings.indicators).length === 0
              ? t(`Select an analysis tool to add an overlay or an indicator within the chart area.`)
              : (
                <div className={styles.title}>{t(`Selected`)}</div>
              )
            }

            <div className={cn(styles.indicatorsList, scrollStyles.scrollbar)}>
              {selectedIndicators.map(indicator => (
                <div
                  key={indicator.key}
                  role="none"
                  className={styles.indicator}
                  onClick={() => this.props.actions.editIndicator(indicator.key)}
                >
                  {indicator.name}

                  <div className={styles.removeButton}>X</div>
                </div>
              ))}
            </div>

          </div>

          <div className={styles.availableContainer}>
            <RoundedInput
              className={styles.searchInput}
              placeholder={t(`Search analysis tools`)}
              onChange={value => this.props.actions.updateIndicatorsSearchString(value)}
            />

            <div className={cn(styles.indicatorsList, scrollStyles.scrollbar, scrollStyles)}>
              {availableIndicators.map(indicator => (
                <div
                  key={indicator.key}
                  role="none"
                  className={cn(styles.indicator, {[styles.notImplemented]: indicator.isNotImplemented})}
                  onClick={() => this.props.actions.editIndicator(indicator.key)}
                >
                  {indicatorsModal.formKey === indicator.key
                    ? (
                      <IndicatorForm indicatorKey={indicator.key} />
                    )
                    : (
                      <div className={styles.body}>
                        {indicator.name}
                      </div>
                    )
                  }
                </div>
              ))
              }
            </div>
          </div>
        </div>

      </div>
    </div>
    )
  }
}

const mapStateToProps = state => ({
	resDex: state.resDex
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(ResDexBuySellActions, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(translate('resdex')(IndicatorsModal))

