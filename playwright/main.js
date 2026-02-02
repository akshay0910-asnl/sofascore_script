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
  "53717",
  "274322",
  "53703",
  "483088",
  "2999",
  "36365",
  "3002",
  "3051",
  "7041",
  "388264",
  "3056",
  "3053",
  "202390",
  "3064",
  "170406",
  "35092",
  "2830",
  "46160",
  "2961",
  "53067",
  "2980",
  "46168",
  "2970",
  "2976",
  "2990",
  "2958",
  "2994",
  "5032",
  "48242",
  "3160",
  "3163",
  "6117",
  "6115",
  "1164534",
  "6111",
  "6109",
  "6105",
  "266626",
  "6910",
  "213609",
  "492848",
  "204126",
  "269199",
  "34318",
  "56021",
  "167228",
  "56027",
  "25856",
  "44259",
  "7734",
  "116221",
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
