// @flow
// Based on https://github.com/kristinbaumann/react-countdown/blob/master/src/Countdown.js

import React, { Component } from 'react'
import { translate } from 'react-i18next'
import cn from 'classnames'
import log from 'electron-log'

import styles from './Countdown.scss'

type Props = {
  t: any,
  date: string | object,
  onStop?: func,
  className?: string
}

class Countdown extends Component {
	props: Props

  constructor(props) {
    super(props)

    this.state = {
      days: 0,
      hours: 0,
      min: 0,
      sec: 0,
    }
  }

  componentDidMount() {
    this.interval = setInterval(() => {
      const date = this.calculateCountdown(this.props.date)
      if (date) {
        this.setState(date)
      } else {
        this.stop()
      }
    }, 1000)
  }

  componentWillUnmount() {
    this.stop()
  }

  calculateCountdown(endDate) {
    let diff = (Date.parse(new Date(endDate)) - Date.parse(new Date())) / 1000

    // clear countdown when date is reached
    if (diff <= 0) return false

    const timeLeft = {
      years: 0,
      days: 0,
      hours: 0,
      min: 0,
      sec: 0
    }

    // calculate time difference between now and expected date
    if (diff >= (365.25 * 86400)) { // 365.25 * 24 * 60 * 60
      timeLeft.years = Math.floor(diff / (365.25 * 86400))
      diff -= timeLeft.years * 365.25 * 86400
    }
    if (diff >= 86400) { // 24 * 60 * 60
      timeLeft.days = Math.floor(diff / 86400)
      diff -= timeLeft.days * 86400
    }
    if (diff >= 3600) { // 60 * 60
      timeLeft.hours = Math.floor(diff / 3600)
      diff -= timeLeft.hours * 3600
    }
    if (diff >= 60) {
      timeLeft.min = Math.floor(diff / 60)
      diff -= timeLeft.min * 60
    }
    timeLeft.sec = diff || 0

    return timeLeft
  }

  stop() {
    clearInterval(this.interval)

    if (this.props.onStop) {
      log.debug('Countdown componenet onStop() triggered.')
      this.props.onStop()
    }
  }

  addLeadingZeros(value) {
    let newValue = String(value)
    while (newValue.length < 2) {
      newValue = `0${newValue}`
    }
    return value
  }

  render() {
    const { t } = this.props
    const countDown = this.state

    return (
      <div className={cn(styles.container, this.props.className)}>
        <div className={styles.columns}>
          <div className={styles.column}>
            <div className={styles.element}>
                <strong>{this.addLeadingZeros(countDown.days)}</strong>
                <div>{t(`D`)}</div>
            </div>
          </div>

          <div className={styles.column}>
            <div className={styles.element}>
              <strong>{this.addLeadingZeros(countDown.hours)}</strong>
              <div>{t(`H`)}</div>
            </div>
          </div>


          <div className={styles.column}>
            <div className={styles.element}>
              <strong>{this.addLeadingZeros(countDown.min)}</strong>
              <div>{t(`M`)}</div>
            </div>
          </div>

          <div className={styles.column}>
            <div className={styles.element}>
              <strong>{this.addLeadingZeros(countDown.sec)}</strong>
              <div>{t(`S`)}</div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default translate('other')(Countdown)
