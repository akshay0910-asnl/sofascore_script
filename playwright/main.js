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

const originalBatch = [
  "1963",
  "21845",
  "1974",
  "1977",
  "1954",
  "1961",
  "2012",
  "1981",
  "2850",
  "24265",
  "2845",
  "35092",
  "2001",
  "39634",
  "49202",
  "22032",
  "3164",
  "3151",
  "3163",
  "5032",
  "3157",
  "3162",
  "7060",
  "47700",
  "33820",
  "6968",
  "32529",
  "7059",
  "188850",
  "39723",
  "5255",
  "21942",
  "252254",
  "87854",
  "2301",
  "2302",
  "44255",
  "260356",
  "313716",
  "309889",
];
const halfway = Math.ceil(originalBatch.length / 2);
const batch1 = originalBatch.slice(0, halfway);
const batch2 = originalBatch.slice(halfway);
const batch3 = [2686, 2713];

processBatches(originalBatch);

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
      currentNode.querySelectorAll(`a[data-id][class^="event"] `).length > 0
    ) {
      for (let anchorElement of currentNode.querySelectorAll(
        `a[data-id][class^="event"] `,
      )) {
        if (anchorElement.querySelector(`div[title="FT"]`) != null) {
          continue;
        }
        const imgElements = anchorElement.querySelectorAll(`img`);
        const teamIds = [...imgElements].map((imgElement) =>
          splits(imgElement.getAttribute(`src`)),
        );
        elementsInBetween1.push(...teamIds);
      }
    }
    currentNode = currentNode.nextElementSibling;
  }

  return Array.from(new Set([...elementsInBetween1]));
}

// ...existing code...
