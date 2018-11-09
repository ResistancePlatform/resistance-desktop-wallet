// @flow
import { Decimal } from 'decimal.js'
import { createActions, handleActions } from 'redux-actions'
import { preloadedState } from '../preloaded.state'

export type Transaction = {
	type?: string,
	category?: string,
	confirmations?: number,
	amount?: Decimal,
	timestamp?: number,
	destinationAddress?: string,
	transactionId?: string
}

export type Balances = {
	transparentBalance: Decimal,
	transparentUnconfirmedBalance?: Decimal,
	privateBalance: Decimal,
	privateUnconfirmedBalance: Decimal,
	totalBalance: Decimal,
	totalUnconfirmedBalance: Decimal
}

export type OverviewState = {
	balances?: Balances,
	transactions?: Array<Transaction>,
	transactionDetails?: object | null | string
}

export const OverviewActions = createActions(
	{
		EMPTY: undefined,

		GET_WALLET_INFO: undefined,
		GOT_WALLET_INFO: (balances: Balances) => balances,
		GET_WALLET_INFO_FAILURE: (errorMessage: string) => ({ errorMessage }),

    GET_TRANSACTION_DATA_FROM_WALLET: undefined,
		GOT_TRANSACTION_DATA_FROM_WALLET: (transactions: Array<Transaction>) => transactions,
		GET_TRANSACTION_DATA_FROM_WALLET_FAILURE: (errorMessage: string) => ({ errorMessage }),

		MAIN_WINDOW_CLOSE: undefined,
		MAIN_WINDOW_MINIMIZE: undefined,
		MAIN_WINDOW_MAXIMIZE: undefined,

    SHOW_TRANSACTION_DETAILS: (transactionId: string) => ({ transactionId }),
		SHOW_TRANSACTION_DETAILS_SUCCEEDED: (transactionDetails: object) => transactionDetails,
		SHOW_TRANSACTION_DETAILS_FAILED: (errorMessage: string) => errorMessage,
		BACK_TO_TRANSACTION_LIST: undefined
	},
	{
		prefix: 'APP/OVERVIEW'
	}
)

export const OverviewReducer = handleActions({
	[OverviewActions.gotWalletInfo]: (state, action) => ({ ...state, balances: action.payload }),
	[OverviewActions.gotTransactionDataFromWallet]: (state, action) => ({ ...state, transactions: action.payload }),
	[OverviewActions.showTransactionDetailsSucceeded]: (state, action) => ({ ...state, transactionDetails: action.payload }),
	[OverviewActions.showTransactionDetailsFailed]: (state, action) => ({ ...state, transactionDetails: action.payload }),
	[OverviewActions.backToTransactionsList]: (state) => ({ ...state, transactionDetails: null })
}, preloadedState)
