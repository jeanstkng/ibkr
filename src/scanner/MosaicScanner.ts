import ibkr, {EventName} from '@stoqey/ib';
import IBKRConnection from '../connection/IBKRConnection';
import {getRadomReqId} from '../_utils/text.utils';
import {ScanMarket, MosaicScannerData} from './scanner.interface';

export class MosaicScanner {
    ib: ibkr;

    constructor() {}

    /**
     * scanMarket
     */
    public scanMarket = (args: ScanMarket): Promise<MosaicScannerData[]> => {
        const ib = IBKRConnection.Instance.getIBKR();
        const {instrument = 'STK', locationCode, numberOfRows, scanCode, stockTypeFilter} = args;
        const randomTicker = getRadomReqId();

        const scansedData: MosaicScannerData[] = [];

        return new Promise((resolve) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const handleScannerData = (tickerId) => {
                ib.off(EventName.scannerData, handleScannerData);
                resolve(scansedData);
            };

            ib.on(
                EventName.scannerData,
                (tickerId, rank, contract: any, distance, benchmark, projection, legsStr) => {
                    scansedData.push({
                        rank,
                        ...(contract || {}),
                        distance,
                        benchmark,
                        projection,
                        legsStr,
                    });
                }
            );

            ib.on(EventName.scannerDataEnd, handleScannerData);

            ib.reqScannerSubscription(randomTicker, {
                instrument,
                locationCode,
                numberOfRows,
                scanCode,
                stockTypeFilter,
            });
        });
    };
}

export default MosaicScanner;
