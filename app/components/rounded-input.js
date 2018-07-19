// @flow
import React, { Component } from 'react'
import styles from './rounded-input.scss'

type RoundedInputAddon = {
    enable: boolean,
    type: 'PASTE' | 'DROPDOWN' | 'TEXT_PLACEHOLDER',
    value: string,
    onAddonClicked: (addonType) => void
}

type Props = {
    name: string,
    title: string,
    onInputChange: (value) => void,
    addon: RoundedInputAddon
}

export default class RoundedInput extends Component<Props> {
    props: Props

    inputOnchangeEventHandler(event) {
        // event.preventDefault()
		event.stopPropagation()
        const newValue = event.target.value;
        // console.log('inputOnchangeEventHandler: ', newValue)

        if (this.props.onInputChange) {
            this.props.onInputChange(newValue)
        }
    }

    onMyAddonClick(event) {
        event.preventDefault()
        event.stopPropagation()
        
        if (this.props.addon.onAddonClicked) {
            this.props.addon.onAddonClicked(this.props.addon.type)
        }
    }

    renderAddon() {
        if (!this.props.addon.enable) {
            return null
        }

        if (this.props.addon.type === 'PASTE') {
            return (
                <span
                    className={styles.roundedInputAddonPaste}
                    onClick={(event) => this.onMyAddonClick(event)}
                    onKeyDown={(event) => this.onMyAddonClick(event)}
                >
                    <i className="fa fa-file-o" />
                    <span className={styles.addOnPaste}>PASTE</span>
                </span>
            )
        } else if (this.props.addon.type === 'DROPDOWN') {
            return (
                <span
                    className={styles.roundedInputAddonDropdown}
                    onClick={(event) => this.onMyAddonClick(event)}
                    onKeyDown={(event) => this.onMyAddonClick(event)}
                >
                    <i className="fa fa-chevron-down" />
                </span>
            )
        } else if (this.props.addon.type === 'TEXT_PLACEHOLDER') {
            return (
                <span className={styles.roundedInputAddonContainer}>{this.props.addon.value}</span>
            )
        }
    }

    render() {
        return (
            <div className={styles.roundedInputContainer} name={this.props.name}>
                <div className={styles.roundedInputTitle}>{this.props.title ? this.props.title : ''}</div>

                <div className={styles.roundedInputTextArea}>
                    <input type="text" onChange={(event) => this.inputOnchangeEventHandler(event)} />
                    {this.renderAddon()}
                </div>
            </div>
        )
    }
}
