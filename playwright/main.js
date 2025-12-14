

const { scrape } = require('./script');

const result = {
	globalStatistics: null,
	teamSlug: null,
	teamId: null,
	teamName: null,
	tournament: null,
	matchLinks: [],
	homeMatchCount: 0,
	awayMatchCount: 0,
	matchStatistics: []
};

async function processBatches(results) {
    for (let i = 0; i < results.length; i++) {
        await scrape(results[i], result);
    }
}

processBatches(['3036', '3009']);

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