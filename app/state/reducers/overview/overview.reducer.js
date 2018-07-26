// @flow
import { AppAction } from '../appAction'

export type Transaction = {
	type?: string,
	direction?: string,
	confirmed?: string,
	amount?: string,
	date?: string,
	destinationAddress?: string,
	transactionId?: string
}

export type Balances = {
	transparentBalance: number,
	transparentUnconfirmedBalance?: number,
	privateBalance: number,
	privateUnconfirmedBalance: number,
	totalBalance: number,
	totalUnconfirmedBalance: number
}

export type OverviewState = {
	balances?: Balances,
	transactions?: Array<Transaction>
}

const overviewActionTypePrefix = 'OVERVIEW_ACTION'

export const OverviewActions = {
	EMPTY: `${overviewActionTypePrefix}: EMPTY`,

	START_GETTING_WALLET_INFO: `${overviewActionTypePrefix}: START_GETTING_WALLET_INFO`,
	STOP_GETTING_WALLET_INFO: `${overviewActionTypePrefix}: STOP_GETTING_WALLET_INFO`,
	GOT_WALLET_INFO: `${overviewActionTypePrefix}: GOT_WALLET_INFO`,

	START_GETTING_TRANSACTION_DATA_FROM_WALLET: `${overviewActionTypePrefix}: START_GETTING_TRANSACTION_DATA_FROM_WALLET`,
	STOP_GETTING_TRANSACTION_DATA_FROM_WALLET: `${overviewActionTypePrefix}: STOP_GETTING_TRANSACTION_DATA_FROM_WALLET`,
	GOT_TRANSACTION_DATA_FROM_WALLET: `${overviewActionTypePrefix}: GOT_TRANSACTION_DATA_FROM_WALLET`,

	MAIN_WINDOW_CLOSE: `${overviewActionTypePrefix}: MAIN_WINDOW_CLOSE`,
	MAIN_WINDOW_MINIMIZE: `${overviewActionTypePrefix}: MAIN_WINDOW_MINIMIZE`,
	MAIN_WINDOW_MAXIMIZE: `${overviewActionTypePrefix}: MAIN_WINDOW_MAXIMIZE`,

	startGettingWalletInfo: (): AppAction => ({ type: OverviewActions.START_GETTING_WALLET_INFO }),
	stopGettingWalletInfo: (): AppAction => ({ type: OverviewActions.STOP_GETTING_WALLET_INFO }),
	gotWalletInfo: (balances: Balances): AppAction => ({ type: OverviewActions.GOT_WALLET_INFO, payload: balances }),

	startGettingTransactionDataFromWallet: (): AppAction => ({ type: OverviewActions.START_GETTING_TRANSACTION_DATA_FROM_WALLET }),
	stopGettingTransactionDataFromWallet: (): AppAction => ({ type: OverviewActions.STOP_GETTING_TRANSACTION_DATA_FROM_WALLET }),
	gotTransactionDataFromWallet: (transactions: Array<Transaction>): AppAction => ({ type: OverviewActions.GOT_TRANSACTION_DATA_FROM_WALLET, payload: transactions }),

	empty: (): AppAction => ({ type: OverviewActions.EMPTY })
}

const initState: OverviewState = {
	balances: {
		transparentBalance: 0,
		transparentUnconfirmedBalance: 0,
		privateBalance: 0,
		privateUnconfirmedBalance: 0,
		totalBalance: 0,
		totalUnconfirmedBalance: 0
	},
	transactions: []
}

export const OverviewReducer = (state: OverviewState = initState, action: AppAction) => {

	switch (action.type) {
		case OverviewActions.GOT_WALLET_INFO:
			return { ...state, balances: action.payload }

		case OverviewActions.GOT_TRANSACTION_DATA_FROM_WALLET:
			return { ...state, transactions: action.payload }

		default:
			return state
	}
}