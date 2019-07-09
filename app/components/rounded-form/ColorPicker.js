import { GithubPicker } from 'react-color'
import React from 'react'

import GenericInput, { GenericInputProps, GenericInputState  } from './GenericInput'

import styles from './ColorPicker.scss'


export type ColorPickerProps = {
  ...GenericInputProps,
	name: string,
  defaultValue?: string,
  readOnly?: boolean
}

type ColorPickerState = {
  ...GenericInputState,
  isVisible: boolean
}

export default class ColorPicker extends GenericInput {
  props: ColorPickerProps
  state: ColorPickerState

	/**
	 * @param {*} props
	 * @memberof ColorPicker
	 */
	constructor(props) {
		super(props)
    this.state.isVisible = false
	}

	/**
	 * @memberof ColorPicker
	 */
  elementRef(element) {
    this.element = element
  }

	/**
	 * @memberof ColorPicker
	 */
	componentDidMount() {
    document.addEventListener('mousedown', e => this.handleOutsideClick(e))
  }

	/**
	 * @memberof ColorPicker
	 */
	componentWillUnmount() {
    document.removeEventListener('mousedown', e => this.handleOutsideClick(e))
	}

  handleOutsideClick(event) {
    if (!this.element) {
      return
    }

    const { isVisible } = this.state

    if (isVisible && !this.element.innerHTML.includes(event.target.outerHTML)) {
      this.setState({ isVisible: false })
    }
  }

  onClickHandler() {
    const { isVisible } = this.state
    this.setState({ isVisible: !isVisible })
  }

  renderInput() {
    const { isVisible, value: color } = this.state

    return (
      <div className={styles.input}>
        <div
          className={styles.color}
          role="none"
          style={{backgroundColor: color}}
          onClick={() => this.onClickHandler()}
        />

        <div ref={el => this.elementRef(el)}>
          {isVisible &&
            <GithubPicker
              color={color}
              className={styles.picker}
              triangle="top-right"
              onChangeComplete={value => this.changeValue(value.hex)}
            />
          }
        </div>
      </div>
    )
  }
}
