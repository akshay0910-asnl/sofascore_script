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
  "2672",
  "2569",
  "1647",
  "1649",
  "1661",
  "1653",
  "1684",
  "1681",
  "1646",
  "6070",
  "1662",
  "1659",
  "25777",
  "3009",
  "3013",
  "36365",
  "2999",
  "3036",
]);

// processBatches([
//   "3076",
//   "24750",
//   "77629",
//   "7032",
//   "207011",
//   "72",
//   "22",
//   "55",
//   "134",
//   "23957",
//   "28",
//   "5",
//   "23",
//   "59",
//   "67",
//   "70",
//   "86",
//   "54",
//   "49",
//   "71",
//   "92",
//   "13",
//   "61",
//   "10",
//   "83",
//   "62",
//   "84",
//   "57",
//   "133",
//   "4875",
//   "19",
//   "53",
//   "65",
//   "76",
//   "68",
//   "69",
//   "4",
//   "66",
//   "82",
//   "23959",
//   "180",
//   "20",
//   "51",
//   "159",
//   "63",
//   "79",
//   "18",
//   "56",
//   "97",
//   "26",
//   "77",
//]);

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
