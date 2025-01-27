
<p align="center">
  <h1 align="center"> IBKR: Interactive Brokers</h1>
</p>



<div align="center">

<img src="./docs/ib-logo-stacked.png"></img>

<div style="display: flex;justify-content:center;">

<img alt="NPM" src="https://img.shields.io/npm/dt/@stoqey/ibkr.svg"></img>
 

</div>

</div>


### Run IBKR in style
This is an event-based ibkr client for node
|       | Feature                                       |
| :---: | --------------------------------------------- |
|   ✅   | Accounts                                      |
|   ✅   | Portfolios                                    |
|   ✅   | Orders (stocks/forex/options/index .e.t.c)    |
|   ✅   | Historical Data                               |
|   ✅   | Realtime price updates                        |
|   ✅   | Contracts (stocks/forex/options/index .e.t.c) |
|   ✅   | Mosaic Market scanner                         |
|   ⬜️   | News                                          |


## 1. Install
```bash
npm i custom-ibkr
```

## 2. Usage

### Initialize
```ts
import ibkr, { AccountSummary, IBKREVENTS, IbkrEvents, PortFolioUpdate, getContractDetails } from 'custom-ibkr';

const ibkrEvents = IbkrEvents.Instance;


// 0. Using env process.env.IB_PORT and process.env.IB_HOST
await ibkr();

// 1. Async 
await ibkr({ port: IB_PORT, host: IB_HOST });

// 2. Callback
ibkr({ port: IB_PORT, host: IB_HOST }).then(started => {
  
    if(!started){
          // Error IBKR has not started
          console.log('error cannot start ibkr');
        //   Not to proceed if not connected with interactive brokers
          return process.exit(1);
    }

    // Your code here

})
```

### Accounts, Summary e.t.c
```ts
const accountId = AccountSummary.Instance.accountSummary.AccountId;
const totalCashValue = AccountSummary.Instance.accountSummary.TotalCashValue;

```
### Portfolios
```ts

// Get current portfolios
const portfolios = Portfolios.Instance;
const accountPortfolios = await portfolios.getPortfolios();

// Subscribe to portfolio updates
ibkrEvents.on(IBKREVENTS.PORTFOLIOS, (porfolios: PortFolioUpdate[]) => {
      // use porfolios  updates here
})

```

### Historical Data + Realtime price updates

- Market data
```ts
import { HistoricalData } from 'custom-ibkr';

// 1. Init
const historyApi = HistoricalData.Instance;

const args = {
  symbol,
  // contract: ib.contract.stock("AAPL"),
  endDateTime = '',
  durationStr = '1 D',
  barSizeSetting = '1 min',
  whatToShow = 'ASK'
};

// 2. Get market data async promise
const data = await historyApi.reqHistoricalData(args);

// OR 

// 3.1 Request for market data using events
historyApi.getHistoricalData(args);
ibkrEvents.emit(IBKREVENTS.GET_MARKET_DATA, args); // the same

// 3.2. Subscribe to market data results
ibkrEvents.on(IBKREVENTS.ON_MARKET_DATA, ({ symbol, marketData }) => {
    //  Use the data here
})
```

- Real-time price updates
```ts
import { PriceUpdates } from 'custom-ibkr';

PriceUpdates.Instance; // init

// subscribe for price updates
ibkrEvents.on(IBKREVENTS.ON_PRICE_UPDATES, (priceUpdates) => {
     // use the price updates here
 });

//  Request price updates
ibkrEvents.emit(IBKREVENTS.SUBSCRIBE_PRICE_UPDATES, { symbol: 'AAPL' });
```

```ts
// Unsubscribe from price updates
ibkrEvents.emit(IBKREVENTS.UNSUBSCRIBE_PRICE_UPDATES, symbol);
```
  
### Contracts
```ts
 
const contractDetails = await getContractDetails(ib.contract.stock("AAPL"));

//  or e.g options
const contractDetails = await getContractDetails({
    currency: 'USD',
    exchange: 'SMART',
    multiplier: 100,
    right: 'C',
    secType: 'OPT',
    strike: 300,
    symbol: 'AAPL'
});

// e.g forex
const contractDetails = await getContractDetails({
    "symbol":"GBP",
    "secType":"CASH",
    "currency":"USD",
     // "localSymbol":"GBP.USD",
});


// or with just a symbol, defaults to stocks
 const contractDetails = await getContractDetails('AAPL');
```

### Orders
```ts
import { Orders, Order, Contract } from 'custom-ibkr';

const orderTrade = Orders.Instance;

const myStockOrder: Order = { ... }
const myStockContract: Contract = { ... }

const placedOrder = await orderTrade.placeOrder(myStockContract, myStockOrder);
          
```

**Order** 
```ts
const stockOrderBuyOut: Order = {
    action: OrderAction.BUY,
    orderType: OrderType.LMT,
    lmtPrice: 200
    totalQuantity: 5
}

const stockContractBuyOut: Contract = {
    symbol: symbol,
    secType: SecType.STK,
    exchange: exchange, // 'SMART'
    currency: currency // 'USD'
}
```

**type**
- limit -> LMT `(action, quantity, lmtPrice)` like in example above
- market -> MKT `(action, quantity, transmitOrder, goodAfterTime, goodTillDate)`
- marketClose -> MOC `(action, quantity, price, transmitOrder)`
- stop -> STP `(action, quantity, price, transmitOrder, parentId, tif)`
- stopLimit -> STP_LMT `(action, quantity, limitPrice, stopPrice, transmitOrder, parentId, tif)`
- trailingStop -> TRAIL `(action, quantity, auxPrice, tif, transmitOrder, parentId)`

**Order events**

- Order filled
```ts
ibkrEvents.on(IBKREVENTS.ORDER_FILLED, (data) => {

});
```

- Order status
```ts
ibkrEvents.on(IBKREVENTS.ORDER_STATUS, (data) => {

});
```

- Open Orders updates
```ts
ibkrEvents.on(IBKREVENTS.OPEN_ORDERS, (data) => {

});
```

**Mosaic Scanner**
```ts
import { MosaicScanner } from 'custom-ibkr';
const mosaicScanner = new MosaicScanner();

const scannerData = await mosaicScanner.scanMarket({
      instrument: 'STK',
      locationCode: 'STK.US.MAJOR',
      numberOfRows: 10,
      scanCode: 'TOP_PERC_GAIN',
      stockTypeFilter: 'ALL'
})
```

see any `.test.ts` file for examples

## 3. Debug

We use [debug](https://github.com/visionmedia/debug) library for logging.
Run with `DEBUG=ibkr:*` to see all logs, or `DEBUG=ibkr:info` for less verbose logs.

#### [See change log for updates](/docs/changelog/README.md)

<div align="center" >
<img style="background:#231f20;color:white; width:100%;padding:10px" src="./docs/logo_interactive-brokers_white.png"></img>
<h3>Forked from Stoqey Inc IBKR<h3>
</div>