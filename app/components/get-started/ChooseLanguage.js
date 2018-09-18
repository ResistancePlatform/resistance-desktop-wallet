// @flow
import React, { Component } from 'react'
import cn from 'classnames'
import Iso6391 from 'iso-639-1'

import { availableLanguages } from '~/i18next.config'

import HLayout from '~/theme/h-box-layout.scss'
import VLayout from '~/theme/v-box-layout.scss'
import styles from './GetStarted.scss'

type Props = {
  actions: object
}


/**
 * @class GetStarted
 * @extends {Component<Props>}
 */
export class ChooseLanguage extends Component<Props> {
	props: Props

	/**
	 * @returns {Array}
   * @memberof ChooseLanguage
	 */
  getLanguageTiles() {
    const languages = Iso6391.getLanguages(availableLanguages)
    return languages.map((language, index) => (
      <div
        role="button"
        tabIndex={index}
        key={language.code}
        className={cn(styles.tile)}
        onClick={() => this.props.actions.chooseLanguage(language.code)}
        onKeyDown={() => this.props.actions.chooseLanguage(language.code)}
      >
        {language.nativeName}
      </div>
    ))
  }

	/**
	 * @returns
   * @memberof ChooseLanguage
	 */
	render() {
		return (
      <div className={cn(HLayout.hBoxChild, VLayout.vBoxContainer, styles.getStartedContainer)}>
        <div className={styles.languageTiles}>
        {this.getLanguageTiles()}
        </div>
      </div>
    )
  }
}
