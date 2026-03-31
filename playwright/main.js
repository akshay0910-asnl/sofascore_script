const { scrape } = require("./script");

async function processBatches(teamIds) {
  for (let i = 0; i < teamIds.length; i++) {
    // let batch = teamIds.slice(i, i + 2);
    // console.log(`Processing batch: ${batch.join(', ')}`);
    // await Promise.allSettled(batch.map(teamId => scrape(teamId)));
    await scrape(teamIds[i]);
  }
}

processBatches(["7"]);

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
