// @flow
import { remote } from 'electron'

/*
const huobiSymbols = [
  'ETH', 'XRP', 'BCH', 'LTC', 'ETC', 'EOS', 'HT', 'ADA', 'ZEC', 'DASH', 'IOTA', 'OMG', 'XMR', 'XMX', 'TRX', 'UUU', 'ALGO', 'BOX', 'RSR', 'SHE',
  'ATP', 'IIC', 'PORTAL', 'CNN', 'BSV', 'LAMB', 'GET', 'KCASH', 'EKT', 'ITC', 'COVA', 'NKN', 'TOS', 'NEO', 'BUT', 'YCC', 'HPT', 'BTT', 'ONT', 'MEX',
  'BKBT', 'ZIL', 'IOST', 'LINK', 'PNT', 'FTI', 'BTM', 'ATOM', 'NEW', 'TNT', 'PC', 'HC', 'TOP', 'ABT', 'PAI', 'CMT', 'TNB', 'AST', 'DOGE', 'EGCC',
  'SSP', 'MT', 'LXT', 'IRIS', 'GXC', 'ETN', 'HOT', 'XLM', 'QTUM', 'TT', 'BAT', 'GTC', 'NAS', 'MAN', 'ELA', 'CTXC', 'EDU', 'UTK', 'HIT', 'XTZ',
  'IDT', 'ZJLT', 'MDS', 'DAC', 'LBA', 'AE', 'SWFTC', 'UC', 'XZC', 'TOPC', 'NPXS', 'WAX', 'MUSK', 'EKO', 'PAY', 'TRIO', 'REQ', 'VET', 'WICC', 'UGAS',
  'STK', 'ELF', 'GAS', 'CHAT', 'DGD', 'YEE', 'WTC', 'REN', 'SEELE', 'LUN', 'AAC', 'OCN', 'DATX', 'BCV', 'ARDR', 'ACT', 'ZLA', 'DTA', 'KAN', 'NEXO',
  'NULS', 'DAT', 'WAN', 'THETA', 'DBC', 'CVCOIN', 'XVG', 'MTN', 'RCCC', '18C', 'AIDOC', 'MANA', 'GSC', 'BLZ', 'QASH', 'SMT', 'RDN', 'LOOM', 'DGB', 'UIP',
  'DOCK', 'SOC', 'ZEN', 'MXC', 'BTS', 'SRN', 'PROPY', 'QUN', 'MEET', 'SNC', 'ICX', 'PHX', 'WPR', 'RUFF', 'NCC', 'BIX', 'ZRX', 'KNC', 'GNX', 'SNT',
  'APPC', 'LYM', 'XEM', 'DCR', 'SC', 'WAVES', 'POLY', 'RCN', 'FAIR', 'NANO', 'STEEM', 'NCASH', 'LET', 'RTE', 'KMD', 'CVNT', 'BFT', 'LSK', 'EVX', 'SALT',
  'MTX', 'OST', 'STORJ', 'GNT', 'CVC', 'GVE', 'QSP', 'MTL', 'ENG', 'GRS', 'MCO', 'POWR', 'ADX', 'RBTC', 'SBTC', 'BCD', 'BCX', 'BIFI', 'BTG',
]

const symbolsToAdd =  [
  '18C', 'AAC', 'ABT', 'ACT', 'ADA', 'ADX', 'AIDOC', 'ALGO', 'APPC', 'ARDR', 'ATOM', 'ATP', 'BCD', 'BCV', 'BCX', 'BFT', 'BIFI', 'BIX', 'BKBT', 'BLZ',
  'BSV', 'BTS', 'BTT', 'BUT', 'CHAT', 'CNN', 'COVA', 'CTXC', 'CVCOIN', 'CVNT', 'DAC', 'DAT', 'DATX', 'DBC', 'DCR', 'DOCK', 'DTA', 'EDU', 'EGCC', 'EKO',
  'EKT', 'ELA', 'ETC', 'ETN', 'EVX', 'FTI', 'GAS', 'GET', 'GNT', 'GNX', 'GSC', 'GTC', 'GVE', 'GXC', 'HC', 'HIT', 'HOT', 'HPT', 'HT', 'IDT',
  'IIC', 'IOTA', 'IRIS', 'ITC', 'KAN', 'KCASH', 'LAMB', 'LBA', 'LET', 'LSK', 'LXT', 'LYM', 'MDS', 'MEET', 'MEX', 'MT', 'MTN', 'MTX', 'MUSK', 'MXC',
  'NANO', 'NCASH', 'NCC', 'NEO', 'NEW', 'NKN', 'NPXS', 'OCN', 'ONT', 'OST', 'PAI', 'PC', 'PHX', 'PNT', 'PORTAL', 'PROPY', 'QUN', 'RBTC', 'RCCC', 'REN',
  'RSR', 'RTE', 'RUFF', 'SBTC', 'SC', 'SEELE', 'SHE', 'SMT', 'SNC', 'SOC', 'SSP', 'STEEM', 'STK', 'SWFTC', 'TNB', 'TNT', 'TOP', 'TOPC', 'TOS', 'TRIO',
  'TRX', 'TT', 'UC', 'UGAS', 'UIP', 'UTK', 'UUU', 'VET', 'WAN', 'WAVES', 'WICC', 'WPR', 'XEM', 'XLM', 'XMR', 'XMX', 'XRP', 'XTZ', 'XVG', 'YCC',
  'YEE', 'ZEN', 'ZJLT', 'ZLA'
]
*/

/*
Info:
We use the `name` property only when the currency is not on `coinmarketcap.com`.
*/

const supportedCurrencies = [
  {
    coin: 'AE',
    name: 'Aeternity',
    etomic: '0x5ca9a71b1d01849c0a95490cc00559717fcf0d1d',
    rpcport: 80,
  },
  {
    coin: 'AST',
    name: 'AirSwap',
    etomic: '0x27054b13b1B798B345b591a4d22e6562d47eA75a',
    rpcport: 80,
  },
  {
    coin: 'BAT',
    name: 'Basic Attention Token',
    etomic: '0x0D8775F648430679A709E98d2b0Cb6250d2887EF',
    rpcport: 80,
  },
  {
    coin: 'BCH',
    rpcport: 33333,
    pubtype: 0,
    p2shtype: 5,
    wiftype: 128,
    txfee: 1000,
    electrumServers: [
      {
        host: 'electrum1.cipig.net',
        port: 10051,
      },
      {
        host: 'electrum2.cipig.net',
        port: 10051,
      },
      {
        host: 'electrum3.cipig.net',
        port: 10051,
      },
    ],
  },
  {
    coin: 'BOX',
    name: 'Beonbox',
    etomic: '0x01e579be97433f861340268521a7a2ab9829082c',
    rpcport: 80,
  },
  {
    coin: 'BTC',
    electrumServers: [
      {
        host: 'electrum1.cipig.net',
        port: 10000,
      },
      {
        host: 'electrum2.cipig.net',
        port: 10000,
      },
      {
        host: 'electrum3.cipig.net',
        port: 10000,
      },
    ],
  },
  {
    coin: 'BTG',
    rpcport: 12332,
    pubtype: 38,
    p2shtype: 23,
    wiftype: 128,
    txfee: 10000,
    electrumServers: [
      {
        host: 'electrum1.cipig.net',
        port: 10052,
      },
      {
        host: 'electrum2.cipig.net',
        port: 10052,
      },
      {
        host: 'electrum3.cipig.net',
        port: 10052,
      },
    ],
  },
  {
    coin: 'BTM',
    name: 'Bytom',
    etomic: '0xcB97e65F07DA24D46BcDD078EBebd7C6E6E3d750',
    rpcport: 80,
  },
  {
    coin: 'CMT',
    name: 'CyberMiles',
    etomic: '0xf85feea2fdd81d51177f6b8f35f0e6734ce45f5f',
    rpcport: 80,
  },
  {
    coin: 'CVC',
    name: 'Civic',
    etomic: '0x41e5560054824eA6B0732E656E3Ad64E20e94E45',
    rpcport: 80,
  },
  {
    coin: 'DASH',
    rpcport: 9998,
    pubtype: 76,
    p2shtype: 16,
    wiftype: 204,
    txfee: 10000,
    electrumServers: [
      {
        host: 'electrum1.cipig.net',
        port: 10061,
      },
      {
        host: 'electrum2.cipig.net',
        port: 10061,
      },
      {
        host: 'electrum3.cipig.net',
        port: 10061,
      },
    ],
  },
  {
    coin: 'DGB',
    rpcport: 14022,
    pubtype: 30,
    p2shtype: 5,
    wiftype: 128,
    txfee: 100000,
    electrumServers: [
      {
        host: 'electrum1.cipig.net',
        port: 10059,
      },
      {
        host: 'electrum2.cipig.net',
        port: 10059,
      },
      {
        host: 'electrum3.cipig.net',
        port: 10059,
      },
    ],
  },
  {
    coin: 'DGD',
    name: 'DigixDAO',
    etomic: '0xE0B7927c4aF23765Cb51314A0E0521A9645F0E2A',
    decimals: 9,
    rpcport: 80,
  },
  {
    coin: 'DOGE',
    rpcport: 22555,
    pubtype: 30,
    p2shtype: 22,
    wiftype: 158,
    txfee: 100000000,
    electrumServers: [
      {
        host: 'electrum1.cipig.net',
        port: 10060,
      },
      {
        host: 'electrum2.cipig.net',
        port: 10060,
      },
      {
        host: 'electrum3.cipig.net',
        port: 10060,
      },
    ],
  },
  {
    coin: 'ELF',
    name: 'aelf',
    etomic: '0xbf2179859fc6D5BEE9Bf9158632Dc51678a4100e',
    rpcport: 80,
  },
  {
    coin: 'ENG',
    name: 'Enigma',
    etomic: '0xf0ee6b27b759c9893ce4f094b49ad28fd15a23e4',
    rpcport: 80,
  },
  {
    coin: 'EOS',
    name: 'EOS',
    etomic: '0x86fa049857e0209aa7d9e616f7eb3b3b78ecfdb0',
    rpcport: 80,
  },
  {
    coin: 'RES',
    rpcport: 18132,
  },
  {
    coin: 'ETH',
    urls: ['https://mainnet.infura.io/v4/125e6ea342154b6bb962b180a15ae497'],
    swap_contract_address: '0x8500AFc0bc5214728082163326C2FF0C73f4a871',
    fname: 'Ethereum',
    etomic: '0x0000000000000000000000000000000000000000',
    rpcport: 80
  },
  {
    coin: 'FAIR',
    rpcport: 40405,
    pubtype: 95,
    p2shtype: 36,
    wiftype: 223,
    txfee: 1000000,
    electrumServers: [
      {
        host: 'electrum1.cipig.net',
        port: 10063,
      },
      {
        host: 'electrum2.cipig.net',
        port: 10063,
      },
      {
        host: 'electrum3.cipig.net',
        port: 10063,
      },
    ],
  },
  {
    coin: 'GRS',
    rpcport: 1441,
    pubtype: 36,
    p2shtype: 5,
    wiftype: 128,
    txfee: 10000,
    electrumServers: [
      {
        host: 'electrum10.groestlcoin.org',
        port: 50001,
      },
      {
        host: 'electrum11.groestlcoin.org',
        port: 50001,
      },
      {
        host: 'electrum13.groestlcoin.org',
        port: 50001,
      },
      {
        host: 'electrum14.groestlcoin.org',
        port: 50001,
      },
    ],
  },
  {
    coin: 'ICX',
    name: 'ICON',
    swap_contract_address: '0x8500AFc0bc5214728082163326C2FF0C73f4a871',
    urls: ['https://mainnet.infura.io/v4/125e6ea342154b6bb962b180a15ae497'],
    etomic: '0xb5a5f22694352c15b00323844ad545abb2b11028',
    decimals: 18,
    rpcport: 80,
  },
  {
    coin: 'IOST',
    name: 'IOST',
    swap_contract_address: '0x8500AFc0bc5214728082163326C2FF0C73f4a871',
    urls: ['https://mainnet.infura.io/v4/125e6ea342154b6bb962b180a15ae497'],
    etomic: '0xfa1a856cfa3409cfa145fa4e20eb270df3eb21ab',
    rpcport: 80,
  },
  {
    coin: 'KMD',
    electrumServers: [
      {
        host: 'electrum1.cipig.net',
        port: 10001,
      },
      {
        host: 'electrum2.cipig.net',
        port: 10001,
      },
      {
        host: 'electrum3.cipig.net',
        port: 10001,
      },
    ],
  },
  {
    coin: 'KNC',
    name: 'Kyber Network',
    swap_contract_address: '0x8500AFc0bc5214728082163326C2FF0C73f4a871',
    urls: ['https://mainnet.infura.io/v4/125e6ea342154b6bb962b180a15ae497'],
    etomic: '0xdd974D5C2e2928deA5F71b9825b8b646686BD200',
    rpcport: 80,
  },
  {
    coin: 'LINK',
    name: 'ChainLink',
    swap_contract_address: '0x8500AFc0bc5214728082163326C2FF0C73f4a871',
    urls: ['https://mainnet.infura.io/v4/125e6ea342154b6bb962b180a15ae497'],
    etomic: '0x514910771af9ca656af840dff83e8264ecf986ca',
    rpcport: 80,
  },
  {
    coin: 'LOOM',
    name: 'Loom Network',
    swap_contract_address: '0x8500AFc0bc5214728082163326C2FF0C73f4a871',
    urls: ['https://mainnet.infura.io/v4/125e6ea342154b6bb962b180a15ae497'],
    etomic: '0xa4e8c3ec456107ea67d3075bf9e3df3a75823db0',
    rpcport: 80,
  },
  {
    coin: 'LTC',
    rpcport: 9332,
    pubtype: 48,
    p2shtype: 5,
    wiftype: 176,
    txfee: 100000,
    electrumServers: [
      {
        host: 'electrum1.cipig.net',
        port: 10065,
      },
      {
        host: 'electrum2.cipig.net',
        port: 10065,
      },
      {
        host: 'electrum3.cipig.net',
        port: 10065,
      },
      {
        host: '34.205.81.68',
        port: 10004,
      }
    ],
  },
  {
    coin: 'LUN',
    name: 'Lunyr',
    swap_contract_address: '0x8500AFc0bc5214728082163326C2FF0C73f4a871',
    urls: ['https://mainnet.infura.io/v4/125e6ea342154b6bb962b180a15ae497'],
    etomic: '0xfa05A73FfE78ef8f1a739473e462c54bae6567D9',
    rpcport: 80,
  },
  {
    coin: 'MAN',
    name: 'Matrix AI Network',
    swap_contract_address: '0x8500AFc0bc5214728082163326C2FF0C73f4a871',
    urls: ['https://mainnet.infura.io/v4/125e6ea342154b6bb962b180a15ae497'],
    etomic: '0xe25bcec5d3801ce3a794079bf94adf1b8ccd802d',
    rpcport: 80,
  },
  {
    coin: 'MANA',
    name: 'Decentraland',
    swap_contract_address: '0x8500AFc0bc5214728082163326C2FF0C73f4a871',
    urls: ['https://mainnet.infura.io/v4/125e6ea342154b6bb962b180a15ae497'],
    etomic: '0x0F5D2fB29fb7d3CFeE444a200298f468908cC942',
    rpcport: 80,
  },
  {
    coin: 'MCO',
    name: 'Monaco',
    swap_contract_address: '0x8500AFc0bc5214728082163326C2FF0C73f4a871',
    urls: ['https://mainnet.infura.io/v4/125e6ea342154b6bb962b180a15ae497'],
    etomic: '0xB63B606Ac810a52cCa15e44bB630fd42D8d1d83d',
    rpcport: 80,
  },
  {
    coin: 'MONA',
    rpcport: 9402,
    pubtype: 50,
    p2shtype: 5,
    wiftype: 176,
    txfee: 100000,
    electrumServers: [
      {
        host: 'electrumx1.monacoin.nl',
        port: 50001,
      },
      {
        host: 'electrumx2.monacoin.nl',
        port: 50001,
      },
      {
        host: 'electrumx1.monacoin.ninja',
        port: 50001,
      },
      {
        host: 'electrumx2.monacoin.ninja',
        port: 50001,
      },
    ],
  },
  {
    coin: 'MTL',
    name: 'Metal',
    swap_contract_address: '0x8500AFc0bc5214728082163326C2FF0C73f4a871',
    urls: ['https://mainnet.infura.io/v4/125e6ea342154b6bb962b180a15ae497'],
    etomic: '0xF433089366899D83a9f26A773D59ec7eCF30355e',
    rpcport: 80,
  },
  {
    coin: 'NAS',
    name: 'Nebulas',
    swap_contract_address: '0x8500AFc0bc5214728082163326C2FF0C73f4a871',
    urls: ['https://mainnet.infura.io/v4/125e6ea342154b6bb962b180a15ae497'],
    etomic: '0x5d65d971895edc438f465c17db6992698a52318d',
    rpcport: 80,
  },
  {
    coin: 'NEXO',
    name: 'nexo',
    swap_contract_address: '0x8500AFc0bc5214728082163326C2FF0C73f4a871',
    etomic: '0xb62132e35a6c13ee1ee0f84dc5d40bad8d815206',
    urls: [ 'mainnet.infura.io/v3/125e6ea342154b6bb962b180a15ae497'],
    rpcport: 80,
  },
  {
    coin: 'NULS',
    name: 'Nuls',
    swap_contract_address: '0x8500AFc0bc5214728082163326C2FF0C73f4a871',
    urls: ['https://mainnet.infura.io/v4/125e6ea342154b6bb962b180a15ae497'],
    etomic: '0xb91318f35bdb262e9423bc7c7c2a3a93dd93c92c',
    rpcport: 80,
  },
  {
    coin: 'OMG',
    name: 'OmiseGo',
    swap_contract_address: '0x8500AFc0bc5214728082163326C2FF0C73f4a871',
    urls: ['https://mainnet.infura.io/v4/125e6ea342154b6bb962b180a15ae497'],
    etomic: '0xd26114cd6EE289AccF82350c8d8487fedB8A0C07',
    rpcport: 80,
  },
  {
    coin: 'PAY',
    name: 'TenX',
    swap_contract_address: '0x8500AFc0bc5214728082163326C2FF0C73f4a871',
    urls: ['https://mainnet.infura.io/v4/125e6ea342154b6bb962b180a15ae497'],
    etomic: '0xB97048628DB6B661D4C2aA833e95Dbe1A905B280',
    rpcport: 80,
  },
  {
    coin: 'POLY',
    name: 'Polymath',
    swap_contract_address: '0x8500AFc0bc5214728082163326C2FF0C73f4a871',
    urls: ['https://mainnet.infura.io/v4/125e6ea342154b6bb962b180a15ae497'],
    etomic: '0x9992ec3cf6a55b00978cddf2b27bc6882d88d1ec',
    rpcport: 80,
  },
  {
    coin: 'POWR',
    name: 'Power Ledger',
    swap_contract_address: '0x8500AFc0bc5214728082163326C2FF0C73f4a871',
    urls: ['https://mainnet.infura.io/v4/125e6ea342154b6bb962b180a15ae497'],
    etomic: '0x595832f8fc6bf59c85c527fec3740a1b7a361269',
    rpcport: 80,
  },
  {
    coin: 'QASH',
    name: 'Qash',
    swap_contract_address: '0x8500AFc0bc5214728082163326C2FF0C73f4a871',
    urls: ['https://mainnet.infura.io/v4/125e6ea342154b6bb962b180a15ae497'],
    etomic: '0x618E75Ac90b12c6049Ba3b27f5d5F8651b0037F6',
    rpcport: 80,
  },
  {
    coin: 'QSP',
    name: 'Quantstamp',
    swap_contract_address: '0x8500AFc0bc5214728082163326C2FF0C73f4a871',
    urls: ['https://mainnet.infura.io/v4/125e6ea342154b6bb962b180a15ae497'],
    etomic: '0x99ea4dB9EE77ACD40B119BD1dC4E33e1C070b80d',
    rpcport: 80,
  },
  {
    coin: 'QTUM',
    rpcport: 3889,
    pubtype: 58,
    p2shtype: 50,
    wiftype: 128,
    txfee: 400000,
    electrumServers: [
      {
        host: 's1.qtum.info',
        port: 50001,
      },
      {
        host: 's2.qtum.info',
        port: 50001,
      },
      {
        host: 's3.qtum.info',
        port: 50001,
      },
      {
        host: 's4.qtum.info',
        port: 50001,
      },
    ],
  },
  {
    coin: 'RCN',
    name: 'Ripio Credit Network',
    swap_contract_address: '0x8500AFc0bc5214728082163326C2FF0C73f4a871',
    urls: ['https://mainnet.infura.io/v4/125e6ea342154b6bb962b180a15ae497'],
    etomic: '0xF970b8E36e23F7fC3FD752EeA86f8Be8D83375A6',
    rpcport: 80,
  },
  {
    coin: 'RDN',
    name: 'Raiden Network Token',
    swap_contract_address: '0x8500AFc0bc5214728082163326C2FF0C73f4a871',
    urls: ['https://mainnet.infura.io/v4/125e6ea342154b6bb962b180a15ae497'],
    etomic: '0x255Aa6DF07540Cb5d3d297f0D0D4D84cb52bc8e6',
    rpcport: 80,
  },
  {
    coin: 'REQ',
    name: 'Request Network',
    swap_contract_address: '0x8500AFc0bc5214728082163326C2FF0C73f4a871',
    urls: ['https://mainnet.infura.io/v4/125e6ea342154b6bb962b180a15ae497'],
    etomic: '0x8f8221aFbB33998d8584A2B05749bA73c37a938a',
    rpcport: 80,
  },
  {
    coin: 'RES',
    name: 'Resistance',
    asset: 'RES',
    rpcport: 18132,
  },
  {
    coin: 'SALT',
    name: 'Salt',
    swap_contract_address: '0x8500AFc0bc5214728082163326C2FF0C73f4a871',
    urls: ['https://mainnet.infura.io/v4/125e6ea342154b6bb962b180a15ae497'],
    etomic: '0x4156D3342D5c385a87D264F90653733592000581',
    rpcport: 80,
  },
  {
    coin: 'SNT',
    name: 'Status',
    swap_contract_address: '0x8500AFc0bc5214728082163326C2FF0C73f4a871',
    urls: ['https://mainnet.infura.io/v4/125e6ea342154b6bb962b180a15ae497'],
    etomic: '0x744d70FDBE2Ba4CF95131626614a1763DF805B9E',
    rpcport: 80,
  },
  {
    coin: 'SRN',
    name: 'SIRIN LABS Token',
    swap_contract_address: '0x8500AFc0bc5214728082163326C2FF0C73f4a871',
    urls: ['https://mainnet.infura.io/v4/125e6ea342154b6bb962b180a15ae497'],
    etomic: '0x68d57c9a1c35f63e2c83ee8e49a64e9d70528d25',
    rpcport: 80,
  },
  {
    coin: 'STORJ',
    name: 'Storj',
    swap_contract_address: '0x8500AFc0bc5214728082163326C2FF0C73f4a871',
    urls: ['https://mainnet.infura.io/v4/125e6ea342154b6bb962b180a15ae497'],
    etomic: '0xB64ef51C888972c908CFacf59B47C1AfBC0Ab8aC',
    rpcport: 80,
  },
  {
    coin: 'THETA',
    name: 'Theta Token',
    swap_contract_address: '0x8500AFc0bc5214728082163326C2FF0C73f4a871',
    urls: ['https://mainnet.infura.io/v4/125e6ea342154b6bb962b180a15ae497'],
    etomic: '0x3883f5e181fccaF8410FA61e12b59BAd963fb645',
    rpcport: 80,
  },
  {
    coin: 'USDT',
    name: 'Tether',
    swap_contract_address: '0x8500AFc0bc5214728082163326C2FF0C73f4a871',
    urls: ['https://mainnet.infura.io/v4/125e6ea342154b6bb962b180a15ae497'],
    etomic: '0xdac17f958d2ee523a2206206994597c13d831ec7',
    rpcport: 80,
  },
  {
    coin: 'WAX',
    name: 'WAX',
    swap_contract_address: '0x8500AFc0bc5214728082163326C2FF0C73f4a871',
    urls: ['https://mainnet.infura.io/v4/125e6ea342154b6bb962b180a15ae497'],
    etomic: '0x39Bb259F66E1C59d5ABEF88375979b4D20D98022',
    rpcport: 80,
  },
  {
    coin: 'WTC',
    name: 'Waltonchain',
    swap_contract_address: '0x8500AFc0bc5214728082163326C2FF0C73f4a871',
    urls: ['https://mainnet.infura.io/v4/125e6ea342154b6bb962b180a15ae497'],
    etomic: '0xb7cb1c96db6b22b0d3d9536e0108d062bd488f74',
    rpcport: 80,
  },
  {
    coin: 'XZC',
    rpcport: 8888,
    pubtype: 82,
    p2shtype: 7,
    wiftype: 210,
    txfee: 10000,
    electrumServers: [
      {
        host: 'electrumx01.zcoin.io',
        port: 50001,
      },
      {
        host: 'electrumx02.zcoin.io',
        port: 50001,
      },
    ],
  },
  {
    coin: 'ZEC',
    active: 0,
    rpcport: 8232,
    taddr: 28,
    pubtype: 184,
    p2shtype: 189,
    wiftype: 128,
    txfee: 10000,
    electrumServers: [
      {
        host: 'electrum1.cipig.net',
        port: 10058,
      },
      {
        host: 'electrum2.cipig.net',
        port: 10058,
      },
      {
        host: 'electrum3.cipig.net',
        port: 10058,
      },
    ],
  },
  {
    coin: 'ZIL',
    name: 'Zilliqa',
    swap_contract_address: '0x8500AFc0bc5214728082163326C2FF0C73f4a871',
    etomic: '0x05f4a42e251f2d52b8ed15e9fedaacfcef1fad27',
    urls: [ 'mainnet.infura.io/v3/125e6ea342154b6bb962b180a15ae497'],
    rpcport: 80,
  },
  {
    coin: 'ZRX',
    name: '0x',
    swap_contract_address: '0x8500AFc0bc5214728082163326C2FF0C73f4a871',
    urls: ['https://mainnet.infura.io/v4/125e6ea342154b6bb962b180a15ae497'],
    etomic: '0xE41d2489571d322189246DaFA5ebDe1F4699F498',
    rpcport: 80,
  },
]

const resCurrency = supportedCurrencies.find(c => c.coin === 'RES')
const resistanceConfig = remote.getGlobal('resistanceNodeConfig')
resCurrency.confpath = resistanceConfig.configPath

export { supportedCurrencies }
