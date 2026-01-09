

const { scrape } = require('./script');

async function processBatches(teamIds) {
    for (let i = 0; i < teamIds.length; i++) {
        // let batch = teamIds.slice(i, i + 2);
        // console.log(`Processing batch: ${batch.join(', ')}`);
        // await Promise.allSettled(batch.map(teamId => scrape(teamId))); 
        await scrape(teamIds[i]);
    }
}

processBatches([2674,2673,2859,2824]);

//['174108', '174098', '174078', '394912', '174104', '174102', '56023', '34313', '168094', '269199', '34315', '56021', '86406', '5198', '5392', '5202', '5199', '274894', '61702', '5395', '5197', '5201']
// ['58687', '55705', '331952', '81309', '8090', '264111', '133444', '42207', '45475', '60428', '40659', '45477', '3396', '3407', '3398', '3405', '36398', '3395']

//Saturday

// Easy Leagues & times
// Scotland - Championship,League One,League Two - 8.30pm
// Brazil - Copinha- Goias U20 - 11.45pm, Corinthians U20 - 11.15pm, Votupora U20 - 12.15am, Gremio U20 - 2.30am, Mirassol U20 - 12.45am,Bahia U20 - 7.30pm
// Wales Cymru Premier - 8pm
// Rwanda Premier League - 6.30pm, 10pm
// England National League- 8.30pm
// Northern Ireland Premiership - 8.30pm
// Malysia Super League - 5.45pm,6.30pm
// Indonesia Liga 1 - 2.00pm
// Cyprus First Division - 8.30pm,10.30pm
// Bahrain Premier League - 6.55pm,9.30pm
// Saudi Pro League - 6.40pm,8.25pm, 11pm
// Israel Premier League - 6.30pm,9.00pm, 10pm
// Liga 2 - 1pm


//Sunday
//Trindiad & Tobago Pro League - 2.30am,4.30am,5.30am
//Israel Premier League - 11.45pm
//Saudi Pro League - 11pm
//Cyprus First Division - 8.30pm,7.30pm
// Australia A-League - 11.30 am
//Indonesia Liga 1 - 12.00pm, 2pm
// Malaysia Super League - 2.45pm




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