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
	popupMenu?: {
		show: boolean,
		posX: number,
		posY: number,
		popupTransactionId: string
	},
	transactionDetail?: object | null | string
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

		UPDATE_POPUP_MENU_VISIBILITY: (show: boolean, posX: number, posY: number, popupTransactionId: string) => ({ show, posX, posY, popupTransactionId }),

		SHOW_TRANSACTION_DETAIL: undefined,
		SHOW_TRANSACTION_DETAIL_SUCCESS: (transactionDetail: TransactionDetail) => transactionDetail,
		SHOW_TRANSACTION_DETAIL_FAIL: (errorMessage: string) => errorMessage,
		BACK_TO_TRANSACTION_LIST: undefined
	},
	{
		prefix: 'APP/OVERVIEW'
	}
)

export const OverviewReducer = handleActions({
	[OverviewActions.gotWalletInfo]: (state, action) => ({ ...state, balances: action.payload }),
	[OverviewActions.gotTransactionDataFromWallet]: (state, action) => ({ ...state, transactions: action.payload }),
	[OverviewActions.updatePopupMenuVisibility]: (state, action) => ({
		...state,
		popupMenu: {
			show: action.payload.show,
			posX: action.payload.posX,
			posY: action.payload.posY,
			popupTransactionId: action.payload.popupTransactionId
		}
	}),
	[OverviewActions.showTransactionDetailSuccess]: (state, action) => ({ ...state, transactionDetail: action.payload }),
	[OverviewActions.showTransactionDetailFail]: (state, action) => ({ ...state, transactionDetail: action.payload }),
	[OverviewActions.backToTransactionList]: (state) => ({ ...state, transactionDetail: null })
}, preloadedState)
