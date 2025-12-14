const axios = require('axios');

let config = {
  method: 'get',
  maxBodyLength: Infinity,
  //url: 'https://www.sofascore.com/api/v1/team/2502/team-statistics/seasons',
  headers: { 
    'accept': '*/*', 
    'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8', 
    'cache-control': 'max-age=0', 
    'cookie': '_uc_referrer=direct; _scid=664dc378-24e2-491f-aca2-79b5167f5f77; _ga=GA1.1.540014192.1699720343; _tt_enable_cookie=1; _ttp=cMMrf90rS6fFsvLmYzLIxkes87E; _cc_id=c7716b502fc5239acb89e41c9a90158a; _sctr=1%7C1706553000000; _scid_r=664dc378-24e2-491f-aca2-79b5167f5f77; __gads=ID=34e06134be5f5647:T=1699720346:RT=1708399210:S=ALNI_MY6dcC6SOcODSTKum5oq5GTNq2IVQ; __gpi=UID=00000c84a372c240:T=1699720346:RT=1708399210:S=ALNI_Mb4Z5K0b7pJoq5yTMr8k5HcCxBYnw; __eoi=ID=6609ac5a42d786ce:T=1706638960:RT=1708399210:S=AA-AfjaJMfs1udlDXvwrBRi6ZWS0; FCCDCF=%5Bnull%2Cnull%2Cnull%2C%5B%22CP6RzMAP6RzMAEsACCENAnEgAAAAAAAAAA6IAAARvADyFyImkaCwPCqQQYoQAIigAAARYBAAAgCAgAAgCUgAQgEIMAAABAAAEAAAAAAQIgCQAIAABAAAAAAAAAAQAAIAAAAAAAQQEAAAAAAAACAAAAQAAAAAAABgEAACAABghCIASQAkJAAAABAAAAABQAAAAAABAAAAJCAAAAAAAAAAAAAIAAAIAAAAAAAACCQAAA.YAAAAAAAAAA%22%2C%222~~dv.41.70.89.108.149.211.2328.313.2373.338.358.10631.2440.415.486.2571.2572.2575.2577.540.2628.2642.2677.2710.2767.2860.2878.2887.2922.981.1029.1046.3100.1092.1097.1126.3182.3190.3234.1201.1205.3290.3292.3327.3331.1301.1344.1516.1558.1584.1598.1651.1697.1716.1753.1810.1832.1985%22%2C%22DD92AEBA-AE65-4687-82E0-A4D7A7715F9C%22%5D%5D; cto_bundle=732fa19GdVZoRHRZJTJCSlFGaHNzM0VPRngwcW94REhoME1sRldzcXBxMEZSRE52R0pwdm5LdzdPdDhEVE9yeHNpWUZvS2hKRVpERndGZ0FZMG04NWJKQzdSbTR2QXFCQVVaRXk0ZkdRUWglMkZUdlg2JTJGQVB5Rm1RMjc5VWhiZTB4dVFVQzQlMkZhcjNMZyUyRk95Z1lZSnZnNHRNbjFNSmlHVVhZVGVMQiUyQlhWbW9VUVhpVTZ2YnJIWUNTS1ZRaHFJTHNoNjZuTlo3NXpaSVU3cXdXVkU4VnFzMUR0eHhCQnBNNmN1TUpHZUU0dUdtZWEwcHNNd0hwMVlzbDJ0QWdGTkNYc3RvUlZxV2YzcHdJRWR0eGNPNnFONnRwVFlxNWlpRUZPaUNPMEY2TEMycEpIJTJCVzVNSGY1TVd2YmZ5SlF1T2N1UVpleG5iNDZL; cto_bidid=2J9ESV9pbUpQbjdFNU8lMkZqdWJtenNDeDlnUEUwcSUyQnZIR1pENFlOSmQ2dkFXSU1ydjVSV2dLTjg3NDhuQ2JsVzFCM052T01Qd0tqTXRuOWh2c1JxUUFlVzZJM0hYMTBTVyUyRjclMkZUbyUyQm95NDQ2dUsxc0xybktNOFl4S3pnRiUyRjROUGkyRXJYMkZabSUyQmh4S0VLNHNTZTR6cEo4T3RVQSUzRCUzRA; _gcl_au=1.1.786011618.1715276796; _ga_HNQ9P9MGZR=deleted; _ga_3KF4XTPHC4=deleted; _ga_QH2YGS7BB4=deleted; _ga_3KF4XTPHC4=deleted; _ga_QH2YGS7BB4=deleted; __qca=P0-1493794981-1719657167179; _ga_HNQ9P9MGZR=deleted; _ga_QH2YGS7BB4=GS1.1.1720268438.1077.1.1720280480.0.0.0; _ga_3KF4XTPHC4=GS1.1.1720268438.19.1.1720280480.0.0.0; _ga_HNQ9P9MGZR=GS1.1.1720268437.534.1.1720280480.0.0.0', 
    'priority': 'u=1, i', 
    //'referer': 'https://www.sofascore.com/team/football/england/4713', 
    'sec-ch-ua': '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"', 
    'sec-ch-ua-mobile': '?0', 
    'sec-ch-ua-platform': '"macOS"', 
    'sec-fetch-dest': 'empty', 
    'sec-fetch-mode': 'cors', 
    'sec-fetch-site': 'same-origin', 
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36', 
    'x-requested-with': '525db1'
  }
};

class MyAxios {
  constructor() {
    this.config = config;
  }

  async get(url,refererUrl) {
    const finalAxiosConfig = {
        ...this.config,
        url: url,
        headers: {
           ...this.config.headers,
            referer: refererUrl
        }
    }
    const response = await axios(finalAxiosConfig);
    return response.data;
  }

}


module.exports = MyAxios;
