const { scrape } = require("./script");

async function processBatches(teamIds) {
  for (let i = 0; i < teamIds.length; i++) {
    // let batch = teamIds.slice(i, i + 2);
    // console.log(`Processing batch: ${batch.join(', ')}`);
    // await Promise.allSettled(batch.map(teamId => scrape(teamId)));
    await scrape(teamIds[i]);
  }
}

processBatches([
  "7",
  "3",
  "14",
  "44",
  "41",
  "43",
  "33",
  "42",
  "2719",
  "2699",
  "2686",
  "2714",
  "2692",
  "2690",
  "2817",
  "2849",
  "2821",
  "2826",
  "2538",
  "2527",
  "2526",
  "2534",
  "1644",
  "1651",
  "1646",
  "1658",
  "1684",
  "1643",
  "1647",
  "1662",
  "1661",
  "1656",
  "2999",
  "3009",
  "4500",
  "3010",
  "2948",
  "2971",
  "2979",
  "2977",
  "2950",
  "2960",
  "3072",
  "3056",
  "5138",
  "3051",
  "3050",
  "3054",
  "4954",
  "3053",
  "4860",
  "2889",
  "2890",
  "2901",
  "368506",
  "5044",
  "2933",
  "2900",
  "2893",
  "2898",
  "6347",
  "267459",
  "3241",
  "3248",
  "3265",
  "3251",
  "3252",
  "120224",
  "3250",
  "5063",
]);

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
