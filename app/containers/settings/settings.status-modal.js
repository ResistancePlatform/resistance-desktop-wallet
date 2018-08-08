/* eslint-disable react/prop-types */

import React from 'react'
import Modal from 'react-modal'


module.exports = (props) => {
  const state = props.parent.props

  return (
    <Modal
      isOpen={state.settings.isStatusModalOpen}
      contentLabel="Services Status"
    >
    <h2>Hello</h2>
    <button
      onClick={event => props.parent.onCloseStatusModalClicked(event)}
      onKeyDown={event => props.parent.onCloseStatusModalClicked(event)}
    >
    Close
    </button>
    <div>I am a modal</div>

    </Modal>
  )
}
