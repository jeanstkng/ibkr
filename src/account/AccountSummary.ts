import includes from 'lodash/includes';
import { getRadomReqId } from '../_utils/text.utils';
import { publishDataToTopic, APPEVENTS } from '../events';
import { IBKRAccountSummary } from './account-summary.interfaces'
import { log } from '../log';
import IBKRConnection from '../connection/IBKRConnection';
import { LIVE_ACCOUNT_IDS } from '../config';


const ib = IBKRConnection.Instance.getIBKR();

export class AccountSummary {
    accountReady: boolean = false;
    tickerId = getRadomReqId();
    AccountId;
    accountSummary: IBKRAccountSummary = {} as any;
    private static _instance: AccountSummary;

    public static get Instance() {
        return this._instance || (this._instance = new this());
    }

    private constructor() {
        const self = this;

        // Record values from here
        ib.on('accountSummary', (reqId, account, tag, value, currency) => {
            this.tickerId = reqId;
            this.AccountId = account;
            this.accountSummary.AccountId = account;
            this.accountSummary[tag] = value; // set the account value
            this.accountSummary.Currency = currency; // always set the account currency
        });

        // Return values from here 
        ib.on('accountSummaryEnd', () => {
            const { AccountId = 'unknown', tickerId, accountReady, accountSummary } = self;

            // We got the account id so success
            log('accountSummaryEnd', { AccountId, tickerId });

            ib.cancelAccountSummary(tickerId);

            if (!accountReady) {
                // Publish account ready
                publishDataToTopic({
                    topic: APPEVENTS.ACCOUNT_SUMMARY,
                    data: {
                        ready: true,
                        accountSummary,
                    }
                })
            }
        });

        // Request Account summary from here
        ib.reqAccountSummary(self.tickerId, 'All', [
            'AccountType',
            'NetLiquidation',
            'TotalCashValue',
            'SettledCash',
            'AccruedCash',
            'BuyingPower',
            'EquityWithLoanValue',
            'PreviousEquityWithLoanValue',
            'GrossPositionValue',
            'RegTEquity',
            'RegTMargin',
            'SMA',
            'InitMarginReq',
            'MaintMarginReq',
            'AvailableFunds',
            'ExcessLiquidity',
            'Cushion',
            'FullInitMarginReq',
            'FullMaintMarginReq',
            'FullAvailableFunds',
            'FullExcessLiquidity',
            'LookAheadNextChange',
            'LookAheadInitMarginReq',
            'LookAheadMaintMarginReq',
            'LookAheadAvailableFunds',
            'LookAheadExcessLiquidity',
            'HighestSeverity',
            'DayTradesRemaining',
            'Leverage'
        ]);

    }

    /**
     * isLiveAccount
     * Check whether this is the live account
     */
    public isLiveAccount(): boolean {
        return includes(LIVE_ACCOUNT_IDS, this.AccountId)
    }
}

export default AccountSummary;