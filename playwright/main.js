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
  
  '3035',
  '49531',
  '38396',
  '2952',
  '2947',
  '2955',
  '2967',
  '2972',
  '2950',
  '2951',
  '2957',
  '2948',
  '2960',
  '2959',
  '2977',
  '5138',
  '3085',
  '3056',
  '7802',
  '3064',
  '6362',
  '3052',
  '3054',
  '2918',
  '4860',
  '2889',
  '2898',
  '2890',
  '2929',
  '2900',
  '389232',
  '5044',
  '2893',
  '3252',
  '5063',
  '3241',
  '7004',
  '5062',
  '3248',
  '2353',
  '2352',
  '2351',
  '2357',
  '2036',
  '25529',
  '2040',
  '2032',
  '5391',
  '5204',
  '395831',
  '56027',
  '168094',
  '56023',
  '168088',
  '21895',
  '25856',
  '3294',
  '3301',
  '5287',
  '2452',
  '2453',
  '2454',
  '2445',
  '2442',
  '2448',
  '2450',
  '2501'
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
