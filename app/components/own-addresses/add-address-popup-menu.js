// @flow
import React, { Component } from 'react';
import styles from './add-address-popup-menu.scss';

type Props = {
  onAddNewTransparentAddressHandler: () => void,
  onAddNewPrivateAddressHandler: () => void,
  onImportPrivateKeyHandler: () => void,
  onExportPrivateKeysHandler: () => void
};

export default class AddAddressPopupMenu extends Component<Props> {
  props: Props;

  eventConfirm(event) {
    event.preventDefault();
    event.stopPropagation();
  }

  onAddNewTransparentAddressClicked(event) {
    this.eventConfirm(event);
    if (this.props.onAddNewTransparentAddressHandler) {
      this.props.onAddNewTransparentAddressHandler(event);
    }
  }

  onAddNewPrivateAddressClicked(event) {
    this.eventConfirm(event);
    if (this.props.onAddNewPrivateAddressHandler) {
      this.props.onAddNewPrivateAddressHandler(event);
    }
  }

  onImportPrivateKeyClicked(event) {
    this.eventConfirm(event);
    if (this.props.onImportPrivateKeyHandler) {
      this.props.onImportPrivateKeyHandler(event);
    }
  }

  onExportPrivateKeysClicked(event) {
    this.eventConfirm(event);
    if (this.props.onExportPrivateKeysHandler) {
      this.props.onExportPrivateKeysHandler(event);
    }
  }

  render() {
    return (
      <div className={[styles.AddAddressPopupMenuContainer].join(' ')}>
        <div
          className={styles.menuItem}
          onClick={event => this.onAddNewTransparentAddressClicked(event)}
          onKeyDown={event => this.onAddNewTransparentAddressClicked(event)}
        >
          NEW TRANSPARENT (K1, JZ) ADDRESS
        </div>
        <div
          className={styles.menuItem}
          onClick={event => this.onAddNewPrivateAddressClicked(event)}
          onKeyDown={event => this.onAddNewPrivateAddressClicked(event)}
        >
          NEW PRIVATE (Z) ADDRESS
        </div>
        <div
          className={styles.menuItem}
          onClick={event => this.onImportPrivateKeyClicked(event)}
          onKeyDown={event => this.onImportPrivateKeyClicked(event)}
        >
          IMPORT PRIVATE KEY
        </div>
        <div
          className={[styles.menuItem, styles.lastMenuItem].join(' ')}
          onClick={event => this.onExportPrivateKeysClicked(event)}
          onKeyDown={event => this.onExportPrivateKeysClicked(event)}
        >
          EXPORT PRIVATE KEYS
        </div>
      </div>
    );
  }
}
