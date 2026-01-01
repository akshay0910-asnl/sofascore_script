

const { scrape } = require('./script');

async function processBatches(teamIds) {
    for (let i = 0; i < teamIds.length; i++) {
        // let batch = teamIds.slice(i, i + 2);
        // console.log(`Processing batch: ${batch.join(', ')}`);
        // await Promise.allSettled(batch.map(teamId => scrape(teamId))); 
        await scrape(teamIds[i]);
    }
}

processBatches(['31']);

//---- Saturday Leagues to process ----
// ['6', '39', '38', '60', '14', '48', '37', '30', '42', '40', '35', '3']
// ['2357', '2347', '2354', '2355', '2356', '2349', '2351', '2359', '2346', '2352']
// ['5395', '5199', '5391', '5197', '5202', '86406']
// ['530631', '34315', '269199', '21895', '34313', '56027']
//A-League Men, England National League,Northern Ireland Premiership,Wales preier,Bahrain Second Division





function getElementsBetween(temp1, temp2) {

    function splits(url) {
        const segments = url.split(`/`);
        for (let i = 0; i < segments.length; i++) {
            let segment = segments[i];
            if (!isNaN(segment) && segment) {
                return segment;
            }
        }
        return '';
    }
    // Ensure temp1 is before temp2 in the DOM
    if (temp1.compareDocumentPosition(temp2) & Node.DOCUMENT_POSITION_PRECEDING) {
        [temp1, temp2] = [temp2, temp1];
    }

    const elementsInBetween1 = [], elementsInBetween2 = [];
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