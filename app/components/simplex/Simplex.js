// @flow
import React, { Component } from 'react'
import { shell } from 'electron'
import cn from 'classnames'

import HLayout from '~/assets/styles/h-box-layout.scss'
import VLayout from '~/assets/styles/v-box-layout.scss'
import styles from './Simplex.scss'

type Props = {
  t: any
}


/**
 * @class Simplex
 * @extends {Component<Props>}
 */
export class Simplex extends Component<Props> {
	props: Props
  webviewElement: any

  /**
   * @memberof Simplex
   */
  componentDidMount() {
    if (!this.webviewElement) {
      return
    }

    this.webviewElement.addEventListener('new-window', event => {
      shell.openExternal(event.url)
    })
  }

	/**
	 * @returns
   * @memberof Simplex
	 */
	render() {
    const { t } = this.props

    return (
      <div className={cn(styles.container, HLayout.hBoxChild, VLayout.vBoxContainer)}>
        <webview
          title={t(`Buy Bitcoin with credit card`)}
          ref={el => {this.webviewElement = el}}
          className={styles.webview}
          src="http://payments.resistance.io:8000/simplex.html"
        />

      </div>
    )
  }
}

