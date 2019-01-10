// @flow
import { Decimal } from 'decimal.js'
import { createActions, handleActions } from 'redux-actions'
import { preloadedState } from '../preloaded.state'
import { SystemInfoActions } from '../system-info/system-info.reducer'

export type AddressRow = {
	balance: Decimal | null,
	confirmed: boolean,
	address: string,
  isUnspent: boolean
}

export type OwnAddressesState = {
	addresses?: AddressRow[],
  showDropdownMenu?: boolean,
  frozenAddresses: { [string]: Decimal },
  connectLedgerModal: {
    isVisible: boolean,
    isLedgerConnected: boolean,
    isLedgerResistanceAppOpen: boolean,
    isTransactionConfirmed: boolean,
    isTransactionSent: boolean,
    ledgerAddress: string,
    destinationAddress: string,
    destinationAmount: Decimal,
    isTransactionPending: boolean,
  }
}

export const OwnAddressesActions = createActions(
  {
    EMPTY: undefined,

    GET_OWN_ADDRESSES: undefined,
    GOT_OWN_ADDRESSES: (addresses: AddressRow[]) => ({ addresses }),
    GET_OWN_ADDRESSES_FAILURE:  (errorMessage: string) => ({ errorMessage }),

    CREATE_ADDRESS: (isPrivate: boolean) => ({ isPrivate }),

    SHOW_CONNECT_LEDGER_MODAL: undefined,
    CONTINUE_TO_CONFIRM_TRANSACTION: undefined,
    CLOSE_CONNECT_LEDGER_MODAL: undefined,
    GET_LEDGER_CONNECTED: undefined,
    GOT_LEDGER_CONNECTED: undefined,
    GOT_LEDGER_RESISTANCE_APP_OPEN: (address: string) => ({ address }),
    GET_LEDGER_CONNECTED_FAILURE: undefined,

    UPDATE_DESTINATION_ADDRESS: (address: string) => ({address}),
    UPDATE_DESTINATION_AMOUNT: (amount: Decimal) => ({amount}),

    SEND_LEDGER_TRANSACTION: undefined,
    SEND_LEDGER_TRANSACTION_SUCCESS: undefined,
    SEND_LEDGER_TRANSACTION_FAILURE: undefined,

    INITIATE_PRIVATE_KEYS_EXPORT: undefined,
    EXPORT_PRIVATE_KEYS: filePath => ({filePath}),
    INITIATE_PRIVATE_KEYS_IMPORT: undefined,
    IMPORT_PRIVATE_KEYS: filePath => ({filePath}),

    MERGE_ALL_MINED_COINS: (zAddress: string) => ({ zAddress }),
    MERGE_ALL_R_ADDRESS_COINS: (zAddress: string) => ({ zAddress }),
    MERGE_ALL_Z_ADDRESS_COINS: (zAddress: string) => ({ zAddress }),
    MERGE_ALL_COINS: (zAddress: string) => ({ zAddress }),

    MERGE_COINS_OPERATION_STARTED: (operationId: string) => ({ operationId }),
    MERGE_COINS_FAILURE: errorMessage => ({ errorMessage })
  },
  {
    prefix: 'APP/OWN_ADDRESSES'
  }
)

function getFrozenAddresses(state, action, rule: (address: AddressRow) => boolean) {
  return state.addresses.reduce((accumulator, address) => {
    const frozenAddresses = {...accumulator}

    if (rule(address) || address.address === action.payload.zAddress) {
      // Save initial balance for it to stay during the 'merge' operation
      frozenAddresses[address.address] = address.balance
    }
    return frozenAddresses
  }, {})
}

export const OwnAddressesReducer = handleActions(
  {
    [OwnAddressesActions.gotOwnAddresses]: (state, action) => ({
      ...state, addresses: action.payload.addresses
    }),
    [OwnAddressesActions.getOwnAddressesFailure]: state => ({
      ...state, addresses: []
    }),
    [OwnAddressesActions.showConnectLedgerModal]: state => ({
      ...state,
      connectLedgerModal: {
        ...state.connectLedgerModal,
        isVisible: true
      }
    }),
    [OwnAddressesActions.gotLedgerConnected]: state => ({
      ...state,
      connectLedgerModal: {
        ...state.connectLedgerModal,
        isLedgerConnected: true,
        isLedgerResistanceAppOpen: false
      }
    }),
    [OwnAddressesActions.gotLedgerResistanceAppOpen]: (state, action) => ({
      ...state,
      connectLedgerModal: {
        ...state.connectLedgerModal,
        isLedgerConnected: true,
        isLedgerResistanceAppOpen: true,
        ledgerAddress: action.payload.address
      }
    }),
    [OwnAddressesActions.getLedgerConnectedFailure]: state => ({
      ...state,
      connectLedgerModal: {
        ...state.connectLedgerModal,
        isLedgerConnected: false,
        isLedgerResistanceAppOpen: false
      }
    }),
    [OwnAddressesActions.sendLedgerTransaction]: state => ({
      ...state,
      connectLedgerModal: {
        ...state.connectLedgerModal,
        isTransactionPending: true
      }
    }),
    [OwnAddressesActions.sendLedgerTransactionSuccess]: state => ({
      ...state,
      connectLedgerModal: {
        ...state.connectLedgerModal,
        isTransactionPending: false,
        ledgerAddress: "",
        destinationAddress: "",
        destinationAmount: Decimal("0")
      }
    }),
    [OwnAddressesActions.sendLedgerTransactionFailure]: state => ({
      ...state,
      connectLedgerModal: {
        ...state.connectLedgerModal,
        isTransactionPending: false
      }
    }),
    [OwnAddressesActions.updateDestinationAddress]: (state, action) => ({
      ...state,
      connectLedgerModal: {
        ...state.connectLedgerModal,
        destinationAddress: action.payload.address
      }
    }),
    [OwnAddressesActions.updateDestinationAmount]: (state, action) => ({
      ...state,
      connectLedgerModal: {
        ...state.connectLedgerModal,
        destinationAmount: action.payload.amount
      }
    }),
    /* [OwnAddressesActions.continueToConfirmTransaction]: state => ({
      ...state,
      connectLedgerModal: {
        ...state.connectLedgerModal,
        isLedgerConnected: true,
        isTransactionConfirmed: true,
        isTransactionSent: true
      }
    }),*/
    [OwnAddressesActions.closeConnectLedgerModal]: state => ({
      ...state,
      connectLedgerModal: {
        ...state.connectLedgerModal,
        isVisible: false,
      }
    }),
    [OwnAddressesActions.mergeAllMinedCoins]: (state, action) => ({
      ...state,
      frozenAddresses: getFrozenAddresses(state, action, (address) => address.isUnspent)
    }),
    [OwnAddressesActions.mergeAllRAddressCoins]: (state, action) => ({
      ...state,
      frozenAddresses: getFrozenAddresses(state, action, (address) => address.address.startsWith('r'))
    }),
    [OwnAddressesActions.mergeAllZAddressCoins]: (state, action) => ({
      ...state,
      frozenAddresses: getFrozenAddresses(state, action, (address) => address.address.startsWith('z'))
    }),
    [OwnAddressesActions.mergeAllCoins]: (state, action) => ({
      ...state, frozenAddresses: getFrozenAddresses(state, action, () => true)
    }),
    [OwnAddressesActions.mergeCoinsFailure]: state => ({
      ...state, frozenAddresses: {}
    }),
    [SystemInfoActions.operationFinished]: (state, action) => (
      ['z_mergetoaddress', 'z_shieldcoinbase'].includes(action.payload.operation.method)
        ? { ...state, frozenAddresses: {} }
        : state
    ),
  }, preloadedState)
