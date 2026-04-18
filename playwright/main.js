const { scrape } = require("./script");
const { ProxyRotator } = require("./proxyRotation");

// ============================================================================
// WITHOUT PROXIES - Original behavior
// ============================================================================

async function processBatchesWithoutProxies(teamIds) {
  console.log("🔓 Running without proxy rotation\n");

  for (let i = 0; i < teamIds.length; i++) {
    console.log(
      `\n📍 Processing team ${i + 1}/${teamIds.length}: ${teamIds[i]}`,
    );
    // Scrape without proxy
    await scrape(teamIds[i]);
  }

  console.log("\n✅ All teams processed!");
}

// ============================================================================
// WITH PROXIES - New proxy rotation behavior
// ============================================================================

async function processBatchesWithProxies(teamIds, rotationInterval = null) {
  // Use provided interval or randomize between 10-15
  const interval = rotationInterval || Math.floor(Math.random() * 6) + 10;

  // Initialize proxy rotator
  const proxyRotator = new ProxyRotator(interval);

  console.log(
    `🔐 Running with proxy rotation (rotate every ${interval} teams)\n`,
  );

  for (let i = 0; i < teamIds.length; i++) {
    console.log(
      `\n📍 Processing team ${i + 1}/${teamIds.length}: ${teamIds[i]}`,
    );

    // Get current proxy configuration
    const proxyConfig = proxyRotator.getPlaywrightProxyConfig();

    // Add random delay between 3-7 seconds to appear more human-like
    const randomDelay = Math.random() * 4000 + 3000;

    // Scrape with proxy and delay
    await scrape(teamIds[i], proxyConfig, randomDelay);

    // Check if we need to rotate proxy
    const shouldRotate = proxyRotator.incrementAndCheckRotation();
    if (shouldRotate) {
      proxyRotator.rotateProxy();

      // Add longer delay (20-40 seconds) when rotating proxy to be extra safe
      const rotationDelay = Math.random() * 20000 + 20000;
      console.log(
        `⏳ Proxy rotation delay: ${(rotationDelay / 1000).toFixed(1)}s\n`,
      );
      await new Promise((resolve) => setTimeout(resolve, rotationDelay));
    }
  }

  // Print final stats
  const stats = proxyRotator.getStats();
  console.log("\n📊 Session Statistics:");
  console.log(
    `   - Total proxies available: ${stats.totalProxies || "None (consider adding proxies)"}`,
  );
  console.log(
    `   - Session duration: ${(stats.sessionDuration / 1000).toFixed(1)}s`,
  );
}

// ============================================================================
// MAIN ENTRY POINT - Choose proxy mode
// ============================================================================

/**
 * Process batches of teams with optional proxy rotation
 * @param {string[]} teamIds - Array of team IDs to process
 * @param {boolean|null|number} useProxies - true/number = use proxies, null/false = old behavior
 *                                            number value = rotation interval
 */
async function processBatches(teamIds, useProxies = null) {
  if (useProxies) {
    // useProxies could be true, a number, or any truthy value
    const rotationInterval = typeof useProxies === "number" ? useProxies : null;
    await processBatchesWithProxies(teamIds, rotationInterval);
  } else {
    // Original behavior without proxies
    await processBatchesWithoutProxies(teamIds);
  }
}

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

// OLD WAY - No proxies (default behavior - backward compatible)
//processBatches([60]);

const batch1 = [
  "494686",
  "118660",
  "370834",
  "230661",
  "7",
  "39",
  "14",
  "40",
  "41",
  "33",
  "38",
  "17",
  "2686",
  "2687",
  "2713",
  "2793",
  "2690",
  "2714",
  "2685",
  "2689",
  "2833",
  "2836",
  "2820",
  "2816",
  "2826",
  "2818",
  "2821",
  "2851",
  "1661",
  "1662",
  "1715",
  "1659",
  "1681",
  "1643",
  "2671",
  "2534",
  "2677",
  "2676",
  "2556",
  "2538",
  "190328",
  "36365",
  "3006",
  "3013",
  "2999",
  "25777",
  "2957",
  "2947",
  "2962",
  "2959",
  "2971",
  "2967",
  "2950",
  "2964",
  "3085",
  "4954",
  "3054",
  "6063",
  "3061",
  "3065",
  "5044",
  "4860",
  "2900",
  "2903",
  "389232",
  "2933",
  "2890",
  "2918",
  "2363",
  "2351",
  "1933",
  "1946",
  "2039",
  "2040",
  "231380",
  "2042",
  "2036",
  "43917",
  "9",
  "64",
  "2561",
  "2591",
  "2598",
  "2530",
  "2542",
  "2557",
  "2741",
  "2705",
  "2735",
  "2770",
  "24516",
  "2745",
  "2973",
  "2966",
  "2961",
  "2990",
  "24750",
  "202391",
  "3101",
  "388264",
  "6366",
  "297102",
  "2051",
  "2075",
  "2203",
  "2055",
  "86406",
  "5204",
  "5197",
  "5399",
  "5198",
  "5202",
  "3367",
  "34695",
  "3376",
  "221241",
  "281331",
  "474991",
  "23951",
  "2219",
  "2230",
  "2207",
  "2208",
  "2218",
  "2224",
  "7739",
  "2216",
  "4502",
  "4901",
  "5064",
  "7915",
  "35268",
  "3121",
  "3112",
  "1295",
  "1288",
  "1281",
  "1289",
  "1285",
  "1286",
  "1301",
  "1284",
  "1161",
  "822",
];

const batch2 = [
  "677",
  "786",
  "687",
  "1165",
  "661",
  "666",
  "1159",
  "676",
  "44259",
  "25856",
  "5287",
  "3292",
  "1759",
  "1891",
  "1767",
  "1807",
  "1892",
  "1786",
  "2454",
  "2501",
  "2445",
  "2448",
  "2453",
  "2442",
  "2452",
  "2446",
  "2325",
  "2334",
  "2326",
  "2323",
  "2320",
  "362016",
  "2321",
  "34425",
  "34218",
  "256902",
  "76451",
  "389226",
  "2704",
  "2697",
  "2825",
  "2819",
  "1649",
  "1656",
  "1958",
  "1982",
  "1961",
  "5981",
  "1957",
  "1963",
  "1954",
  "1999",
  "4500",
  "3002",
  "7040",
  "3053",
  "3064",
  "5138",
  "34469",
  "44441",
  "21895",
  "39733",
  "36833",
  "7628",
  "7629",
  "3217",
  "3215",
  "3211",
  "1931",
  "1950",
  "6672",
  "2032",
  "2835",
  "2858",
  "1973",
  "135514",
  "39634",
  "49202",
  "47504",
  "2020",
  "22032",
  "342775",
  "7314",
  "2022",
  "46161",
  "46168",
  "46160",
  "2978",
  "53067",
  "2958",
  "3076",
  "3066",
  "55603",
  "6414",
  "207011",
  "55625",
  "3080",
  "262480",
  "6229",
  "249952",
  "6235",
  "7745",
  "6230",
  "418693",
  "6117",
  "6116",
  "6112",
  "89374",
  "6103",
  "6107",
  "1164534",
  "504899",
  "7918",
  "3117",
  "1302",
];

const batch3 = [
  "4872",
  "423186",
  "6968",
  "32529",
  "396625",
  "33820",
  "505268",
  "58319",
  "43568",
  "241703",
  "43566",
  "266626",
  "42365",
  "43561",
  "43567",
  "79081",
  "283972",
  "295403",
  "116221",
  "1787",
  "1764",
  "1793",
  "1758",
  "309889",
  "342076",
  "463097",
  "313716",
  "285689",
  "2315",
  "170366",
  "25914",
  "44444",
  "44439",
];

processBatches([35, 34, 2693, 2699, 2849, 2859, 38396, 3010]);

// WITH PROXIES - Auto rotate every 10-15 teams
// processBatches(["11", "27"], true);

// WITH PROXIES - Custom rotation interval (every 8 teams)
// processBatches(["11", "27"], 8);

//['30', '14', '43', '33', '35', '7', '42', '38']
//['2793', '2686', '2696', '2699']
//['2846', '2814', '2828', '2820', '2816', '2833', '2677', '2524', '2674', '2538']
//['6070', '1661', '1643', '1647', '1656', '1646', '1651', '1715']
//['38396', '3011', '36365', '3014']
//['2955', '2959', '2968', '2951', '2948', '2950', '7802', '3072', '3056', '3052', '3053', '5138']
//['2893', '4860', '2898', '2888', '2929', '389232', '6347', '3245', '267459', '3250', '3251', '6342', '3248', '3252']

function getElementsBetween(temp1, temp2) {
  function splits(url) {
    const segments = url.split(`/`);
    for (let i = 0; i < segments.length; i++) {
      let segment = segments[i];
      if (!isNaN(segment) && segment) {
        return segment;
      }
    }
    return "";
  }
  // Ensure temp1 is before temp2 in the DOM
  if (temp1.compareDocumentPosition(temp2) & Node.DOCUMENT_POSITION_PRECEDING) {
    [temp1, temp2] = [temp2, temp1];
  }

  const elementsInBetween1 = [],
    elementsInBetween2 = [];
  let currentNode = temp1.nextElementSibling;

  while (currentNode && currentNode !== temp2) {
    if (currentNode.querySelectorAll(`a img`) != null) {
      for (let imgElement of currentNode.querySelectorAll(`a img`)) {
        const teamId = splits(imgElement.getAttribute(`src`));
        elementsInBetween1.push(teamId);
      }
    }
    currentNode = currentNode.nextElementSibling;
  }

  currentNode = temp1.nextElementSibling;

  while (currentNode && currentNode !== temp2) {
    if (currentNode.querySelectorAll(`a img`) != null) {
      for (let imgElement of currentNode.querySelectorAll(`a img`)) {
        const teamId = splits(imgElement.getAttribute(`src`));
        elementsInBetween2.push(teamId);
      }
    }
    currentNode = currentNode.nextElementSibling;
  }

  return Array.from(new Set([...elementsInBetween1, ...elementsInBetween2]));
}
