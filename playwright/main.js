

const { scrape } = require('./script');

async function processBatches(teamIds) {
    for (let i = 0; i < teamIds.length; i++) {
        // let batch = teamIds.slice(i, i + 2);
        // console.log(`Processing batch: ${batch.join(', ')}`);
        // await Promise.allSettled(batch.map(teamId => scrape(teamId))); 
        await scrape(teamIds[i]);
    }
}

processBatches(['3009']);

//---- Saturday Leagues to process ----

// Serie A - ['2690', '2693', '2689', '2704', '2696', '2719', '2695', '2699']
// Liga Portugal - ['49531', '3035']
// Belgian Pro League - ['2900', '2898', '2889', '2933', '368506', '2918', '5044', '389232']
// Scottish Premiership - ['2354', '2353', '2357', '2363', '2356', '2352', '2351', '2346', '2359', '2347', '2355', '2349']
// Saudi Pro League - ['56027', '204126', '23400', '336456', '34315', '34313']

//Serie B,Turkiye 1 Lig,

// Easy bets - Ghana,Qatar, Algeria, Bahrain,Indonesia, Cambodia, Egypt


// --- Sunday Leagues to process ----

// Premier League - ['41', '34', '7', '33']
// Serie A - ['2737', '2687', '2692', '2701', '2761', '2714', '2685', '2793']
// Liga Portugal - ['4500', '190328', '36365', '3009', '25777', '3010', '2999', '3006']
// Belgian Pro League - ['2903', '2893']

//Serie B,Turkiye 1 Lig,

// Easy bets - Ghana,Qatar, Algeria, Bahrain,Indonesia, Cambodia, Egypt, UAE, Australia A League





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