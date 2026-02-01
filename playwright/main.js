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
  "44",
  "39",
  "40",
  "50",
  "35",
  "43",
  "14",
  "7",
  "33",
  "17",
  "2719",
  "2701",
  "2696",
  "2689",
  "2685",
  "2692",
  "2704",
  "2686",
  "2761",
  "2697",
  "2846",
  "2817",
  "2829",
  "2818",
  "2816",
  "2828",
  "2859",
  "2821",
  "2677",
  "2538",
  "5138",
  "3061",
  "3072",
  "2895",
  "2898",
  "2901",
  "2900",
  "389232",
  "2890",
  "4860",
  "2888",
  "2918",
  "5044",
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
