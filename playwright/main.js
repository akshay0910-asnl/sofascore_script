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
  "2826",
  "2819",
  "2849",
  "2828",
  "2836",
  "2885",
  "2825",
  "1647",
  "1641",
  "1644",
  "1656",
  "1651",
  "1653",
  "2547",
  "2671",
  "2674",
  "2676",
  "2672",
  "5885",
  "2534",
  "2600",
  "2569",
  "2677",
  "2681",
  "36360",
  "26245",
  "26243",
  "3013",
  "483088",
  "25777",
  "3011",
  "3014",
  "3035",
  "49531",
  "3006",
  "2948",
  "2947",
  "2951",
  "2967",
  "2953",
  "2952",
  "2990",
  "2963",
  "3052",
  "3086",
  "3053",
  "3061",
  "3051",
  "3054",
  "2929",
  "2933",
  "5046",
  "169260",
  "2893",
  "2918",
  "2898",
  "2890",
  "7004",
  "120224",
  "6347",
  "3265",
  "6342",
  "5062",
  "2363",
  "2346",
  "2356",
  "2355",
  "2357",
  "2359",
  "2347",
  "2349",
  "65668",
  "3219",
  "3218",
  "189723",
  "43917",
  "2032",
  "6672",
  "2040",
  "5152",
  "25736",
  "282203",
  "5153",
  "7080",
  "21825",
  "46",
  "31",
  "58",
  "29",
  "27",
  "15",
  "96",
  "263",
  "32",
  "1",
  "25",
  "95",
  "2",
  "9",
  "21",
  "45",
  "12",
  "8",
  "74",
  "47",
  "24",
  "11",
  "64",
  "36",
];
const batch2 = [
  "1159",
  "687",
  "1082002",
  "2312",
  "56023",
  "530631",
  "204126",
  "167228",
  "168086",
  "21895",
  "3291",
  "79081",
  "3294",
  "24798",
  "7734",
  "116221",
  "1807",
  "1760",
  "1793",
  "1891",
  "2052",
  "5405",
  "2049",
  "2113",
  "34695",
  "41537",
  "34697",
  "281331",
  "474991",
  "3376",
  "6118",
  "6106",
  "2219",
  "2216",
  "2204",
  "2224",
  "2220",
  "7739",
  "6064",
  "2207",
  "23951",
  "2230",
  "3106",
  "3115",
  "7915",
  "3121",
  "1676",
  "52874",
  "1654",
  "1655",
  "1672",
  "1682",
  "1642",
  "1680",
  "1685",
  "1675",
  "6925",
  "1678",
  "1652",
  "1673",
  "1711",
  "210894",
  "6918",
  "1671",
  "44320",
  "3076",
  "202390",
  "4952",
  "262480",
  "7032",
  "388264",
  "207011",
  "77629",
  "55603",
  "55625",
  "6366",
];
const batch3 = [];

processBatches(batch1);

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

// ...existing code...

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
    if (!currentNode.getAttribute("class").includes("pb_sm")) {
      currentNode = currentNode.nextElementSibling;
      continue;
    }

    if (
      currentNode.querySelectorAll(`a[data-id][class^="event"] img`) != null
    ) {
      for (let imgElement of currentNode.querySelectorAll(
        `a[data-id][class^="event"] img`,
      )) {
        const teamId = splits(imgElement.getAttribute(`src`));
        elementsInBetween1.push(teamId);
      }
    }
    currentNode = currentNode.nextElementSibling;
  }

  return Array.from(new Set([...elementsInBetween1]));
}

// ...existing code...
