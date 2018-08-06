// @flow
import React, { Component } from 'react'
import styles from './rounded-input.scss'

type RoundedInputAddon = {
	enable: boolean,
	type: 'PASTE' | 'DROPDOWN' | 'TEXT_PLACEHOLDER',
	value: string | undefined,
	onAddonClicked: addonType => void | null | undefined
}

type Props = {
	name: string,
	title: string,
	onlyNumberAllowed: boolean | undefined,
	onInputChange: value => void,
	addon: RoundedInputAddon,
	disabled?: boolean,
	children: any
}

export default class RoundedInput extends Component<Props> {
	props: Props
	inputDomRef: any

	constructor(props) {
		super(props)
		this.inputDomRef = React.createRef()
	}

	inputOnchangeEventHandler(event) {
		event.stopPropagation()
		const newValue = event.target.value

		if (this.props.onInputChange) {
			this.props.onInputChange(newValue)
		}
	}

	onMyAddonClick(event) {
		event.preventDefault()
		event.stopPropagation()

		if (this.props.addon.onAddonClicked && !this.props.disabled) {
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
					onClick={event => this.onMyAddonClick(event)}
					onKeyDown={event => this.onMyAddonClick(event)}
				>
					<i className="icon-paste" />
					<span className={styles.addOnPaste}>PASTE</span>
				</span>
			)
		} else if (this.props.addon.type === 'DROPDOWN') {
			return (
				<span
					className={styles.roundedInputAddonDropdown}
					onClick={event => this.onMyAddonClick(event)}
					onKeyDown={event => this.onMyAddonClick(event)}
				>
					<i className="icon-arrow-down" />
				</span>
			)
		} else if (this.props.addon.type === 'TEXT_PLACEHOLDER') {
			return (
				<span className={styles.roundedInputAddonTextPlaceholder}>
					{this.props.addon.value}
				</span>
			)
		}
	}

	render() {
		return (
			<div
				name={this.props.name}
				disabled={this.props.disabled}
				className={styles.roundedInputContainer}
			>
				<div className={styles.roundedInputTitle}>
					{this.props.title ? this.props.title : ''}
				</div>

				<div className={styles.roundedInputTextArea}>
					<input
						ref={this.inputDomRef}
						type={this.props.onlyNumberAllowed ? 'number' : 'text'}
						disabled={this.props.disabled}
						onChange={event => this.inputOnchangeEventHandler(event)}
					/>
					{this.renderAddon()}
				</div>
				{this.props.children ? this.props.children : null}
			</div>
		)
	}
}
