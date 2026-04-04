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
processBatches([
  "2349",
  "2359",
  "2355",
  "2032",
  "2040",
  "2042",
  "2039",
  "2675",
  "2588",
  "2591",
  "2542",
  "2540",
  "2576",
  "2052",
  "2113",
  "5405",
  "2076",
  "2052",
  "2113",
  "5405",
  "2076",
  "7739",
  "2230",
  "2219",
  "4871",
  "2220",
  "2205",
  "2207",
  "2224",
  "4502",
  "2208",
  "3112",
  "3122",
  "35268",
  "3115",
  "3110",
  "4901",
  "7691",
  "3121",
  "34469",
  "204126",
  "530631",
  "168094",
  "21895",
  "56021",
  "1807",
  "1793",
  "1758",
  "1783",
]);

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
