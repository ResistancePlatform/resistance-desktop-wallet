// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import RounedInput, { RoundedInputAddon } from '../../components/rounded-input';
import {
  SendCashActions,
  SendCashState
} from '../../state/reducers/send-cash/send-cash.reducer';
import { appStore } from '../../state/store/configureStore';
import styles from './send-cash.scss';
import HLayout from '../../theme/h-box-layout.scss';
import VLayout from '../../theme/v-box-layout.scss';

type Props = {
  sendCash: SendCashState
};

/**
 * @class SendCash
 * @extends {Component<Props>}
 */
class SendCash extends Component<Props> {
  props: Props;

  /**
   * @memberof SendCash
   */
  componentDidMount() {}

  /**
   * @memberof SendCash
   */
  componentWillUnmount() {}

  eventConfirm(event) {
    event.preventDefault();
    event.stopPropagation();
  }

  getPrivatelyToggleButtonClasses() {
    return this.props.sendCash.isPrivateSendOn
      ? `${styles.toggleButton} ${styles.toggleButtonOn}`
      : `${styles.toggleButton}`;
  }

  getSendLockClasses() {
    return this.props.sendCash.isPrivateSendOn ? `fa fa-lock` : `fa fa-unlock`;
  }

  getSendTips() {
    const prefixTips = `You are about to send money from`;
    return this.props.sendCash.isPrivateSendOn
      ? `${prefixTips} Private (Z) address to Private address. This transaction will be invisible to everyone.`
      : `${prefixTips} Transparent (K1,JZ) address to Transparent address. This transaction will be visible to everyone.`;
  }

  getPrivatelyToggleButtonText() {
    return this.props.sendCash.isPrivateSendOn ? `ON` : `OFF`;
  }

  onPrivateSendToggleClicked(event) {
    this.eventConfirm(event);
    appStore.dispatch(SendCashActions.togglePrivateSend());
  }

  onFromAddressDropdownClicked(addonType) {
    console.log(`onFromAddressDropdownClicked: ${addonType}`);
  }

  onFromAddressInputChanged(value) {
    appStore.dispatch(SendCashActions.updateFromAddress(value));
  }

  onDestAddressPasteClicked(addonType) {
    console.log(`onDestAddressPasteClicked: ${addonType}`);
  }

  onDestAddressInputChanged(value) {
    appStore.dispatch(SendCashActions.updateToAddress(value));
  }

  onAmountAddressInputChanged(value) {
    appStore.dispatch(SendCashActions.updateAmount(parseFloat(value)));
  }

  onSendButtonClicked(event) {
    this.eventConfirm(event);
    appStore.dispatch(SendCashActions.sendCash());
  }

  getOperationProgressBarStyles() {
    const flexValue = this.props.sendCash.currentOperation.percent / 100;
    return { flex: flexValue };
  }

  renderProgressRow() {
    if (!this.props.sendCash || !this.props.sendCash.currentOperation) {
      return null;
    }
    return (
      <div className={[styles.processRow, VLayout.vBoxContainer].join(' ')}>
        <div className={[styles.row1, HLayout.hBoxContainer].join(' ')}>
          <div className={styles.processRow1Title}>LAST OPERATION STATUS: </div>
          <div className={styles.processRow1Status}>IN PROGRESS</div>
          <div
            className={[styles.processRow1Percent, HLayout.hBoxChild].join(' ')}
          >
            {this.props.sendCash.currentOperation.percent}%
          </div>
        </div>

        <div className={[styles.row2, HLayout.hBoxContainer].join(' ')}>
          <div
            className={styles.progressBarPercent}
            style={this.getOperationProgressBarStyles()}
          />
        </div>
      </div>
    );
  }

  /**
   * @returns
   * @memberof SendCash
   */
  render() {
    const fromAddressAddon: RoundedInputAddon = {
      enable: true,
      type: 'DROPDOWN',
      onAddonClicked: this.onFromAddressDropdownClicked
    };

    const destAddressAddon: RoundedInputAddon = {
      enable: true,
      type: 'PASTE',
      onAddonClicked: this.onDestAddressPasteClicked
    };

    const amountAddressAddon: RoundedInputAddon = {
      enable: true,
      type: 'TEXT_PLACEHOLDER',
      value: 'RES',
      onAddonClicked: () => {}
    };

    return (
      // Layout container
      <div
        className={[
          styles.layoutContainer,
          HLayout.hBoxChild,
          VLayout.vBoxContainer
        ].join(' ')}
      >
        {/* Route content */}
        <div
          className={[
            styles.sendCashContainer,
            VLayout.vBoxChild,
            HLayout.hBoxContainer
          ].join(' ')}
        >
          <div
            className={[
              HLayout.hBoxChild,
              VLayout.vBoxContainer,
              styles.wrapperContainer
            ].join(' ')}
          >
            {/* Title bar */}
            <div className={styles.titleBar}>Send Cash</div>

            {/* Send from */}
            <div className={styles.sendFromContainer}>
              <div className={styles.sendFromTitle}>SEND FROM</div>

              <div className={styles.sendFromCheckboxContainer}>
                <span>
                  <input type="radio" name="sendFromType" checked />Transparent
                  address
                </span>
                <span>
                  <input type="radio" name="sendFromType" />Private address
                </span>
              </div>
            </div>

            {/* From address */}
            <div className={styles.fromAddressContainer}>
              <RounedInput
                name="from-address"
                title="FROM ADDRESS"
                addon={fromAddressAddon}
                onInputChange={value => this.onFromAddressInputChanged(value)}
              />

              {/* Toggle button */}
              <div className={styles.sendPrivatelyToggleContainer}>
                <div className={styles.toggleButtonContainerTitle}>
                  SEND PRIVATELY
                </div>

                <div
                  className={this.getPrivatelyToggleButtonClasses()}
                  onClick={event => this.onPrivateSendToggleClicked(event)}
                  onKeyDown={event => this.onPrivateSendToggleClicked(event)}
                >
                  <div className={styles.toggleButtonSwitcher} />
                  <div className={styles.toggleButtonText}>
                    {this.getPrivatelyToggleButtonText()}
                  </div>
                </div>
              </div>
            </div>

            {/* Destination address */}
            <RounedInput
              name="destination-address"
              title="DESTINATION ADDRESS"
              addon={destAddressAddon}
              onInputChange={value => this.onDestAddressInputChanged(value)}
            />

            {/* Amount */}
            <div className={styles.amountContainer}>
              <RounedInput
                name="amount"
                title="AMOUNT"
                onlyNumberAllowed="true"
                addon={amountAddressAddon}
                onInputChange={value => this.onAmountAddressInputChanged(value)}
              />
              <div className={styles.transactionFeeContainer}>
                <span className={styles.part1}>TRANSACTION FEE: </span>
                <span className={styles.part2}>0.0001</span>
                <span className={styles.part3}>RES</span>
              </div>
            </div>

            {/* Send button row */}
            <div
              className={[
                styles.sendButtonContainer,
                HLayout.hBoxContainer
              ].join(' ')}
            >
              <button
                name="send-cash"
                disabled={
                  this.props.sendCash.currentOperation &&
                  this.props.sendCash.currentOperation.operationId
                }
                onClick={event => this.onSendButtonClicked(event)}
                onKeyDown={event => this.onSendButtonClicked(event)}
              >
                SEND
              </button>
              <div className={[styles.desc, HLayout.hBoxContainer].join(' ')}>
                <div className={styles.descIcon}>
                  <i className={this.getSendLockClasses()} />
                </div>
                <div className={styles.descContent}>{this.getSendTips()}</div>
              </div>
            </div>

            {/* Process row */}
            {this.renderProgressRow()}

            {/* Memo */}
            <div className={styles.memoConatiner}>
              <span className={styles.memoTitle}>Memo:</span>
              When sending cash from a Transparent (K1,JZ) address, the
              remaining balance is sent to another out-generated K1,JZ address.
              When sending from a Private (Z) address, the remaining unsent
              balance remains with the Z address. In both case the original
              sending address cannot be usef for sending again unit the
              transaction is confirmed. The address is temporarily remove from
              the list. Freshly mined coins may only be sent to a Private (Z)
              address.
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  sendCash: state.sendCash
});

export default connect(mapStateToProps, null)(SendCash);