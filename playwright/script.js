#!/usr/bin/env node
// Playwright script to scrape team statistics and match data from SofaScore
// Usage: node playwright/script.js https://www.sofascore.com/football/team/arsenal/42

let chromium;
try {
	({ chromium } = require('playwright'));
} catch (e) {
	({ chromium } = require('@playwright/test'));
}

const fs = require('fs');
const path = require('path');
const { writeFile } = require('fs/promises');

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
	selectors: {
		statisticsTab: '[data-testid="tab-statistics"]',
		tournamentCombobox: 'button.dropdown__button[role="combobox"][aria-haspopup="listbox"]',
		cardComponent: '.md\\:bg_surface\\.s1.card-component',
		tournamentElement: '.md\\:bg_surface\\.s1.card-component .card-component.never',
		tournamentHeader: 'div.d_flex.ai_center',
		ftIndicator: 'div[title="FT"]',
		liveScoreDiv: 'div[title*="live score"]',
		scoreBox: '.score-box',
		jsonLdScript: 'script[type="application/ld+json"]',
		teamImg: `img`

	},
	timeouts: {
		pageLoad: 50000,
		statisticsTab: 30000,
		combobox: 15000,
		cardComponent: 10000
	},
	buttons: {
		nextButton: '.md\\:bg_surface\\.s1.card-component button.enabled\\:active\\:bg_primary\\.highlight.enabled\\:focusVisible\\:bg_primary\\.highlight'
	}
};

// ============================================================================
// RESULT OBJECT
// ============================================================================

let cache = {};

let result = {
	globalStatistics: {},
	teamSlug: null,
	teamId: null,
	teamName: null,
	tournament: null,
	matchLinks: [],
	homeMatchCount: 0,
	awayMatchCount: 0,
	matchStatistics: [],
	attempts: 0
};

// ============================================================================
// STATISTICS TRANSFORMATION
// ============================================================================

function transformStatistics(data) {
	const { statistics: stats } = data;
	const m = stats.matches;

	return {
		corners: (stats.corners / m).toFixed(2),
		fouls: (stats.fouls / m).toFixed(2),
		goalKicks: (stats.goalKicks / m).toFixed(2),
		saves: (stats.saves / m).toFixed(2),
		offsides: (stats.offsides / m).toFixed(2),
		shotsOnTarget: `${(stats.shotsOnTarget / m).toFixed(2)}/${(stats.shotsOnTargetAgainst / m).toFixed(2)}`,
		yellowCards: `${(stats.yellowCards / m).toFixed(2)}/${(stats.yellowCardsAgainst / m).toFixed(2)}`,
		goals: `${(stats.goalsScored / m).toFixed(2)}/${(stats.goalsConceded / m).toFixed(2)}`,
		throwIns: (stats.throwIns / m).toFixed(2),
		ballPossession: stats.averageBallPossession,
		tackles: `${(stats.tackles / m).toFixed(2)}/${(stats.tacklesAgainst / m).toFixed(2)}`,
		interceptions: `${(stats.interceptions / m).toFixed(2)}/${(stats.interceptionsAgainst / m).toFixed(2)}`,
		aerialDuels: (stats.aerialDuelsWon / m).toFixed(2),
		aerialDuelsAttempted: (stats.totalAerialDuels / m).toFixed(2),
		dribbles: `${(stats.successfulDribbles / m).toFixed(2)}/${(stats.dribbleAttemptsWonAgainst / m).toFixed(2)}`,
		dribblesAttempted: `${(stats.dribbleAttempts / m).toFixed(2)}/${(stats.dribbleAttemptsTotalAgainst / m).toFixed(2)}`
	};
}

function transformMatchStatistics(data, matchData) {
	const matchStats = {
		corners: `0/0${matchData.isHome ? '[H]' : '[A]'}`,
		fouls: `0/0${matchData.isHome ? '[H]' : '[A]'}`,
		goalKicks: `0/0${matchData.isHome ? '[H]' : '[A]'}`,
		saves: `0/0${matchData.isHome ? '[H]' : '[A]'}`,
		offsides: `0/0${matchData.isHome ? '[H]' : '[A]'}`,
		shotsOnTarget: `0/0${matchData.isHome ? '[H]' : '[A]'}`,
		yellowCards: `0/0${matchData.isHome ? '[H]' : '[A]'}`,
		goals: matchData.isHome ? `${matchData.goals[0]}/${matchData.goals[1]}[H]` : `${matchData.goals[1]}/${matchData.goals[0]}[A]`,
		throwIns: `0/0${matchData.isHome ? '[H]' : '[A]'}`,
		averageBallPossession: `0/0${matchData.isHome ? '[H]' : '[A]'}`,
		teams: matchData.isHome ? [matchData.teams[0], matchData.teams[1], 'Home'].join(",") : [matchData.teams[1], matchData.teams[0], 'Away'].join(","),
		tackles: `0/0${matchData.isHome ? '[H]' : '[A]'}`,
		interceptions: `0/0${matchData.isHome ? '[H]' : '[A]'}`,
		aerialDuels: `0/0${matchData.isHome ? '[H]' : '[A]'}`,
		aerialDuelsAttempted: `0${matchData.isHome ? '[H]' : '[A]'}`,
		dribbles: `0/0${matchData.isHome ? '[H]' : '[A]'}`,
		dribblesAttempted: `0/0${matchData.isHome ? '[H]' : '[A]'}`
	}


	const { statistics } = data
	const allStatistics = statistics.find((x) => x.period === 'ALL')

	for (const group of allStatistics.groups) {
		const { statisticsItems } = group
		for (const item of statisticsItems) {
			const { name, awayValue, homeValue, awayTotal, homeTotal } = item;
			switch (name) {
				case 'Corner kicks': {
					matchStats.corners = matchData.isHome ? `${homeValue || 0}/${awayValue || 0}[H]` : `${awayValue || 0}/${homeValue || 0}[A]`
					break;
				}
				case `Ball possession`: {
					matchStats.averageBallPossession = matchData.isHome ? `${homeValue || 0}/${awayValue || 0}[H]` : `${awayValue || 0}/${homeValue || 0}[A]`
					break;
				}
				case `Fouls`: {
					matchStats.fouls = matchData.isHome ? `${homeValue || 0}/${awayValue || 0}[H]` : `${awayValue || 0}/${homeValue || 0}[A]`
					break;
				}
				case `Goal kicks`: {
					matchStats.goalKicks = matchData.isHome ? `${homeValue || 0}/${awayValue || 0}[H]` : `${awayValue || 0}/${homeValue || 0}[A]`
					break;
				}
				case `Total saves`: {
					matchStats.saves = matchData.isHome ? `${homeValue || 0}/${awayValue || 0}[H]` : `${awayValue || 0}/${homeValue || 0}[A]`
					break;
				}
				case `Offsides`: {
					matchStats.offsides = matchData.isHome ? `${homeValue || 0}/${awayValue || 0}[H]` : `${awayValue || 0}/${homeValue || 0}[A]`
					break;
				}
				case `Shots on target`: {
					matchStats.shotsOnTarget = matchData.isHome ? `${homeValue || 0}/${awayValue || 0}[H]` : `${awayValue || 0}/${homeValue || 0}[A]`
					break;
				}
				case `Yellow cards`: {
					matchStats.yellowCards = matchData.isHome ? `${homeValue || 0 || 0}/${awayValue || 0 || 0}[H]` : `${awayValue || 0 || 0}/${homeValue || 0 || 0}[A]`
					break;
				}
				case `Throw-ins`: {
					matchStats.throwIns = matchData.isHome ? `${homeValue || 0}/${awayValue || 0}[H]` : `${awayValue || 0}/${homeValue || 0}[A]`
					break;
				}
				case `Tackles`: {
					matchStats.tackles = matchData.isHome ? `${homeValue || 0}/${awayValue || 0}[H]` : `${awayValue || 0}/${homeValue || 0}[A]`
					break;
				}
				case `Interceptions`: {
					matchStats.interceptions = matchData.isHome ? `${homeValue || 0}/${awayValue || 0}[H]` : `${awayValue || 0}/${homeValue || 0}[A]`
					break;
				}
				case `Aerial duels`: {
					matchStats.aerialDuels = matchData.isHome ? `${homeValue || 0}/${awayValue || 0}[H]` : `${awayValue || 0}/${homeValue || 0}[A]`
					matchStats.aerialDuelsAttempted = matchData.isHome ? `${homeTotal || 0}/${awayTotal || 0}[H]` : `${awayTotal || 0}/${homeTotal || 0}[A]`
					break;
				}
				case 'Dribbles': {
					matchStats.dribbles = matchData.isHome ? `${homeValue || 0}/${awayValue || 0}[H]` : `${awayValue || 0}/${homeValue || 0}[A]`
					matchStats.dribblesAttempted = matchData.isHome ? `${homeTotal || 0}/${awayTotal || 0}[H]` : `${awayTotal || 0}/${homeTotal || 0}[A]`
					break;
				}
				default: {
					break;
				}
			}
		}
	}

	return { ...matchStats, isHome: matchData.isHome };
}

function parseCombinedStatistics(teamId) {
	const intermediate = cache[teamId].matchStatistics.reduce((acc, curr) => {
		for (const key of Object.keys(curr)) {
			const value = curr[key];
			if (acc[key]) {
				acc[key] = `${acc[key].toString()}+${value.toString()}`;
			} else {
				acc[key] = value.toString();
			}
		}
		return acc;
	}, {});

	const resultModified = Object.entries(intermediate).reduce((acc, [key, value]) => {
		const newValue = value.split('+');
		let numeratorCount = 0, denominatorCount = 0, count = 0,
			numeratorCountHome = 0, denominatorCountHome = 0, countHome = 0,
			numeratorCountAway = 0, denominatorCountAway = 0, countAway = 0;
		for (const val of newValue) {
			const isHome = val.includes('[H]');
			const isAway = !isHome;
			const breakSegments = val.split('/');
			const numerator = parseInt(breakSegments[0]);
			const denominator = parseInt(breakSegments[1]);
			numeratorCount += numerator;
			denominatorCount += denominator;
			count++;
			if (isHome) {
				numeratorCountHome += numerator;
				denominatorCountHome += denominator;
				countHome++;
			}
			if (isAway) {
				numeratorCountAway += numerator;
				denominatorCountAway += denominator;
				countAway++;
			}
		}
		if (key !== 'teams' && key !== 'isHome') {
			acc[`${key}Totals`] = `${numeratorCount}/${denominatorCount}`;
			acc[`${key}TotalsHome`] = `${numeratorCountHome}/${denominatorCountHome}`;
			acc[`${key}TotalsAway`] = `${numeratorCountAway}/${denominatorCountAway}`;
			acc[`${key}Average`] = `${(numeratorCount / count).toFixed(2)}/${(denominatorCount / count).toFixed(2)}`;
			acc[`${key}AverageHome`] = `${(numeratorCountHome / countHome).toFixed(2)}/${(denominatorCountHome / countHome).toFixed(2)}`;
			acc[`${key}AverageAway`] = `${(numeratorCountAway / countAway).toFixed(2)}/${(denominatorCountAway / countAway).toFixed(2)}`;
		}
		return acc;

	}, { ...intermediate });

	//result.combinedMatchStatistics = resultModified;
	cache = { ...cache, [teamId]: { ...cache[teamId], combinedMatchStatistics: { ...resultModified } } };
	//cache[teamId].combinedMatchStatistics = {...resultModified};

}

// ============================================================================
// API INTERCEPTION
// ============================================================================

const handleStatisticsResponse = async (response, teamId) => {
	const url = response.url();
	if (url.includes('/api/v1/team/') && url.includes('/statistics/')) {
		try {
			// Check if response is OK before attempting to parse JSON
			if (!response.ok()) {
				console.warn(`⚠ Statistics response returned status ${response.status()}`);
				return;
			}
			const data = await response.json();
			//result.globalStatistics = transformStatistics(data);
			cache[teamId].globalStatistics = transformStatistics(data);
			console.log('✓ Statistics intercepted');
		} catch (err) {
			console.error('✗ Failed to parse statistics:', err.message);
		}
	}
};

const handleMatchStatisticsResponse = async (response, match, index, page, teamId) => {
	const url = response.url(), exit = false;
	const matchId = extractMatchId(match.href);

	if (url === "https://www.sofascore.com/api/v1/event/" + matchId + "/statistics") {
		try {
			// Check if response is OK before attempting to parse JSON
			if (!response.ok()) {
				console.warn(`⚠ Match statistics response returned status ${response.status()} for match ${matchId}`);
				return;
			}
			console.log('On index:', index, 'Match ID:', matchId);
			const data = await response.json();
			// result.matchStatistics[index] = {
			// 	...(result.matchStatistics[index] || {}),
			// 	...transformMatchStatistics(data, match)
			// };

			///Commented next three lines to get rid of reference problem
			cache[teamId].matchStatistics[index] = {
				...(cache[teamId].matchStatistics[index] || {}),
				...transformMatchStatistics(data, match)
			};

			// cache = {
			// 	...cache, [teamId]: {
			// 		...cache[teamId], matchStatistics: cache[teamId].matchStatistics.map((x, indexInner) => {
			// 			return indexInner === index ? { ...(cache[teamId].matchStatistics[indexInner] || {}), ...transformMatchStatistics(data, match) } : x
			// 		})
			// 	}
			// };

			console.log('✓ Match Statistics intercepted');
			await page.off('response', (response) => handleMatchStatisticsResponse(response, match, index, page)); // Remove listener after capturing
			await page.close(); // Close the match page after capturing statistics
		} catch (err) {
			console.error('✗ Failed to parse statistics:', err.message);
		}
	}

};

async function setupStatisticsInterception(page, teamId) {
	page.on('response', (response) => handleStatisticsResponse(response, teamId));
}

async function setUpMatchStatisticsInterception(page, match, index, teamId) {
	page.on('response', (response) => handleMatchStatisticsResponse(response, match, index, page, teamId));
}


// ============================================================================
// PAGE NAVIGATION
// ============================================================================

async function navigateToPage(page, url, teamId) {
	for (let attempt = 1; attempt <= 3; attempt++) {
		try {
			await page.goto(url, {
				waitUntil: 'load',
				timeout: CONFIG.timeouts.pageLoad
			});
			console.log('✓ Page loaded:', await page.title());
			return; // Success - exit the function
		}
		catch (err) {
			console.error(`✗ Page load error (attempt ${attempt}/${3}):`, err.message);
			cache[teamId].attempts += 1;

			if (attempt === 3) {
				// Final attempt failed
				throw new Error(`Failed to load page after ${3} attempts: ${err.message}`);
			}

			console.log('  Retrying...');
		}
	}
}

async function clickStatisticsTab(page) {
	try {
		await page.waitForSelector(CONFIG.selectors.statisticsTab, {
			state: 'visible',
			timeout: CONFIG.timeouts.statisticsTab
		});
		await page.click(CONFIG.selectors.statisticsTab);
		console.log('✓ Statistics tab clicked');
	} catch (err) {
		console.error('✗ Could not click statistics tab:', err.message);
	}
}

async function navigateToMatchPage(page, match, index, teamId) {
	try {
		await setUpMatchStatisticsInterception(page, match, index, teamId);
		console.log('Processing match index:', index);
		await page.goto(match.href, { waitUntil: 'load', timeout: CONFIG.timeouts.pageLoad });
		console.log('Navigated to index:', index);
		const url = page.url();
		console.log('Current match page URL:', url);
		if (!url.includes(',tab:statistics')) {
			cache[teamId]['timeouts'] = cache[teamId]['timeouts'] || {};
			cache[teamId]['timeouts'][match.href] = setTimeout(async () => {
				await page.click(CONFIG.selectors.statisticsTab);
				console.log('✓ Statistics tab clicked');
			}, 3000); // 5 seconds timeout
		}

		// await page.waitForSelector(CONFIG.selectors.statisticsTab, {
		// 	state: 'visible',
		// 	timeout: CONFIG.timeouts.statisticsTab
		// });
		// await page.click(CONFIG.selectors.statisticsTab);
		// console.log('✓ Statistics tab clicked on match page');
	}
	catch (err) {
		console.error('✗ Could not click statistics tab:', err.message);
	}
}

// ============================================================================
// TEAM INFORMATION EXTRACTION
// ============================================================================

async function extractTeamInfo(page, teamId) {
	try {
		const url = page.url();
		const match = url.match(/\/football\/team\/([^\/]+)\/(\d+)/);

		if (match) {
			//result.teamSlug = match[1];
			//result.teamId = match[2];
			cache[teamId].teamSlug = match[1];
			cache[teamId].teamId = match[2]
			console.log(`✓ Team info extracted: ${cache[teamId].teamSlug} (ID: ${cache[teamId].teamId})`);
		}
	} catch (err) {
		console.error('✗ Error extracting team info:', err.message);
	}
}

async function extractTeamName(page, teamId) {
	try {
		const scripts = await page.$$eval(CONFIG.selectors.jsonLdScript, elements =>
			elements.map(el => {
				try {
					return JSON.parse(el.textContent);
				} catch {
					return null;
				}
			})
		);

		for (const data of scripts) {
			if (data?.['@type'] === 'BreadcrumbList' && data.itemListElement?.length > 0) {
				//result.teamName = data.itemListElement[data.itemListElement.length - 1].name;
				cache[teamId].teamName = data.itemListElement[data.itemListElement.length - 1].name;
				console.log(`✓ Team name: ${cache[teamId].teamName}`);
				return;
			}
		}

		console.log('⚠ Team name not found in breadcrumb');
	} catch (err) {
		console.error('✗ Error extracting team name:', err.message);
	}
}

// ============================================================================
// TOURNAMENT EXTRACTION
// ============================================================================

async function extractTournament(page, teamId) {
	try {
		await page.waitForSelector(CONFIG.selectors.tournamentCombobox, {
			state: 'visible',
			timeout: CONFIG.timeouts.combobox
		});

		const button = await page.$(CONFIG.selectors.tournamentCombobox);
		//result.tournament = await button.evaluate(el => el.innerText);
		cache[teamId].tournament = await button.evaluate(el => el.innerText);
		console.log(`✓ Tournament: ${cache[teamId].tournament}`);
	} catch (err) {
		console.error('✗ Could not extract tournament:', err.message);
	}
}

// ============================================================================
// MATCH DATA EXTRACTION FROM TEAM PAGE
// ============================================================================

async function extractMatchScore(linkElement, index, teamId) {
	try {
		const hasFT = await linkElement.$(CONFIG.selectors.ftIndicator).catch(() => null);
		if (!hasFT) return;

		const href = await linkElement.getAttribute('href');

		// Extract teams
		let teams = [];
		try {
			const liveScoreDiv = await linkElement.$(CONFIG.selectors.liveScoreDiv);
			if (liveScoreDiv) {
				const text = await liveScoreDiv.evaluate(el => el.innerText);
				teams = text.split('\n').filter(line => line.trim());
			}
		} catch (err) {
			console.error(`⚠ Error extracting teams from match ${index}:`, err.message);
		}

		let teamIds = [];
		const images = await linkElement.$$(CONFIG.selectors.teamImg).catch(() => null);
		try {
			for (const imgElement of images) {
				const src = await imgElement.getAttribute('src');
				const teamIdNow = src.split('/').find(segment => parseInt(segment));
				teamIds.push(teamIdNow);
			}
		} catch (err) {
			console.error(`⚠ Error extracting team IDs from match ${index}:`, err.message);
		}

		// Extract scores
		let scores = [];
		try {
			const scoreBoxes = await linkElement.$$(CONFIG.selectors.scoreBox);
			for (const box of scoreBoxes) {
				const score = await box.evaluate(el => el.innerText.trim());
				if (score.includes("\n")) {
					const parts = score.split("\n");
					if (parts.length >= 1) {
						scores.push(parts[0].trim());
					}
					else {
						scores.push(score);
					}
					continue;
				}
				if (!isNaN(score)) scores.push(score);
				else { console.log(score) }
			}
		} catch (err) {
			console.error(`⚠ Error extracting scores from match ${index}:`, err.message);
		}

		// Count home and away matches based on team position
		//const teamIndex = teams.indexOf(result.teamName);
		const teamIndex = teamIds.findIndex(teamId1 => (teamId1 == cache[teamId].teamId)); //teams.indexOf(cache[teamId].teamName);
		let isHome;
		if (teamIndex === 0) {
			//result.homeMatchCount += 1;
			if (cache[teamId].homeMatchCount > 3) {
				return
			}
			cache[teamId].homeMatchCount += 1;
			isHome = true;
		} else if (teamIndex === 1) {
			//result.awayMatchCount += 1;
			if (cache[teamId].awayMatchCount > 3) {
				return
			}
			cache[teamId].awayMatchCount += 1;
			isHome = false;
		}

		console.log(`⚽ Match ${index}: ${teams.join(' vs ')} - Score: ${scores.join('-')}`);

		//ßresult = { ...result, matchLinks: [...result.matchLinks, { href: `https://www.sofascore.com${href},tab:statistics`, teams, goals: scores, isHome }] }
		cache = { ...cache, [teamId]: { ...cache[teamId], matchLinks: [...cache[teamId].matchLinks, { href: `https://www.sofascore.com${href},tab:statistics`, teams, goals: scores, teamIds, isHome }] } }

	} catch (err) {
		console.error(`✗ Error extracting match score:`, err.message);
		return;
	}
}

async function extractTournamentMatches(page, index, teamId) {
	// if (result.homeMatchCount >= 4 && result.awayMatchCount >= 4) {
	// 	return;
	// }

	if (cache[teamId].homeMatchCount >= 4 && cache[teamId].awayMatchCount >= 4) {
		return;
	}

	const selector = `${CONFIG.selectors.tournamentElement}:nth-child(${index + 1})`;

	try {
		const headerText = await page.$eval(
			`${selector} ${CONFIG.selectors.tournamentHeader}`,
			el => el.innerText
		).catch(() => null);

		// Skip if not the current tournament
		//if (headerText !== result.tournament) return;
		if (headerText !== cache[teamId].tournament) return;

		const linkElements = await page.$$(`${selector} a`);

		for (let i = 0; i < linkElements.length; i++) {
			await extractMatchScore(linkElements[i], i, teamId);
		}

		return;
	} catch (err) {
		console.error(`✗ Error extracting tournament matches [${index}]:`, err.message);
		return null;
	}
}

async function processAllMatches(page, context, teamId) {
	try {
		await page.waitForSelector(CONFIG.selectors.cardComponent, {
			state: 'attached',
			timeout: CONFIG.timeouts.cardComponent
		});

		const tournamentElements = await page.$$(CONFIG.selectors.tournamentElement);
		console.log(`✓ Found ${tournamentElements.length} tournament elements`);

		for (let i = 0; i < tournamentElements.length; i++) {
			await extractTournamentMatches(page, i, teamId);
		}

		// Click the second next button after loop completes
		const nextButtons = await page.$$(CONFIG.buttons.nextButton);
		if (nextButtons.length >= 2) {
			await nextButtons[0].click();
			console.log('✓ Clicked next button');
			//await page.waitForTimeout(2000)
			await new Promise(resolve => setTimeout(resolve, 2000));
			//if (!(result.homeMatchCount >= 4 && result.awayMatchCount >= 4)) {
			if (!(cache[teamId].homeMatchCount >= 4 && cache[teamId].awayMatchCount >= 4)) {
				await processAllMatches(page, context, teamId);
			}
			else {
				await openMatchLinks(page, context, teamId);
			}
		}
	} catch (err) {
		console.error('✗ Error processing matches:', err.message);
	}
}

// ============================================================================
// MATCH DATA EXTRACTION FROM MATCH PAGE
// ============================================================================

const extractMatchId = url =>
	(url.split('#')[1]?.split(',').find(p => p.startsWith('id:')) || '').replace('id:', '') || null;

async function processMatchDetails(page, match, index, teamId) {
	// Implement match details processing here

	await navigateToMatchPage(page, match, index, teamId);
	//await setUpMatchStatisticsInterception(page, match, index);

}

async function openMatchLinks(page, context, teamId) {
	//console.log(`✓ Processing ${result.matchLinks.length} match links`);
	console.log(`✓ Processing ${cache[teamId].matchLinks.length} match links`);
	
	for (let i = 0; i < cache[teamId].matchLinks.length; i += 2) {
		const batch = [];
		
		// Create a batch of up to 2 match processing promises
		for (let j = i; j < Math.min(i + 2, cache[teamId].matchLinks.length); j++) {
			const match = cache[teamId].matchLinks[j];
			const absoluteIndex = j; // global index
			
			const batchPromise = (async () => {
				try {
					const matchPage = await context.newPage();
					await processMatchDetails(matchPage, match, absoluteIndex, teamId);
				} catch (err) {
					console.error(`✗ Error in match index ${absoluteIndex}:`, err.message);
				}
			})();
			
			batch.push(batchPromise);
		}
		
		// Wait for the entire batch to complete before processing the next batch
		await Promise.all(batch);
	}
}

// ============================================================================
// BROWSER KEEP-ALIVE
// ============================================================================

async function keepBrowserOpenTillRequired(page, teamId) {
	return new Promise((resolve, reject) => {
		try {
			const interval = setInterval(async () => {
				const allCollected = isAllDataCollected(teamId);
				if (allCollected) {
					cache[teamId].endTime = new Date();
					cache[teamId].totalTimeSeconds = parseFloat(((cache[teamId].endTime - cache[teamId].startTime) / 1000).toFixed(2));
					console.log('\n✓ All data collected. Closing browser.');
					page.off('response', handleStatisticsResponse);
					clearInterval(interval);
					await page.context().browser().close();
					await parseCombinedStatistics(teamId);
					await writeStatisticsToFile(teamId);
					if (cache[teamId]['timeouts']) {
						for (const timeoutKey of Object.keys(cache[teamId]['timeouts'])) {
							clearTimeout(cache[teamId]['timeouts'][timeoutKey]);
						}
					}
					delete cache[teamId];
					result = {
						globalStatistics: {},
						teamSlug: null,
						teamId: null,
						teamName: null,
						tournament: null,
						matchLinks: [],
						homeMatchCount: 0,
						awayMatchCount: 0,
						matchStatistics: [],
						attempts: 0
					};
					resolve(1);
				} else {
					console.log('\n⏳ Waiting for all data to be collected...');
					//console.log(JSON.stringify(result, null, 2));
				}
			}, 2000); // 2 seconds
		} catch (err) {
			console.error('✗ Error in keep-alive mechanism:', err.message);
			reject(err);
		}
	})
}

// ============================================================================
// ORCHESTRATION
// ============================================================================

async function executeWorkflow(page, context, teamId) {
	try {

		cache = { ...cache, [teamId]: { ...result, matchStatistics: result.matchStatistics.map(x => x), matchLinks: result.matchLinks.map(x => x), globalStatistics: { ...result.globalStatistics }, startTime : new Date() } || {} };

		// Setup and navigate
		await setupStatisticsInterception(page, teamId);
		await navigateToPage(page, `https://www.sofascore.com/football/team/cp/${teamId}#tab:statistics`, teamId);

		// Click statistics and extract tournament
		//await clickStatisticsTab(page);
		await extractTournament(page, teamId);

		// Extract team info
		await extractTeamInfo(page, teamId);
		await extractTeamName(page, teamId);

		// Extract match data
		await processAllMatches(page, context, teamId);

		// Keep browser open until all data is collected
		await keepBrowserOpenTillRequired(page, teamId);
		console.log('✓ Workflow completed successfully');
	} catch (err) {
		console.error('✗ Workflow error:', err.message);
		process.exitCode = 1;
	}
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function isAllDataCollected(teamId) {
	// if (result?.matchStatistics?.length !== result?.matchLinks?.length) {
	// 	return false
	// }
	if (cache[teamId]?.matchStatistics?.length !== cache[teamId]?.matchLinks?.length) {
		return false
	}

	// const homeMatchesWithDataAvailable = result.matchStatistics.filter(stat => stat && stat.isHome).length;
	// const awayMatchesWithDataAvailable = result.matchStatistics.filter(stat => stat && !stat.isHome).length;
	const homeMatchesWithDataAvailable = cache[teamId].matchStatistics.filter(stat => stat && stat.isHome).length;
	const awayMatchesWithDataAvailable = cache[teamId].matchStatistics.filter(stat => stat && !stat.isHome).length;

	// if (homeMatchesWithDataAvailable < 4 || awayMatchesWithDataAvailable < 4) {
	// 	return false
	// }
	if (homeMatchesWithDataAvailable < 4 || awayMatchesWithDataAvailable < 4) {
		return false
	}

	return true
}

async function writeStatisticsToFile(teamId) {
	const filePath = path.join(__dirname, '..', 'teamsData', `${cache[teamId].teamSlug}.json`);
	try {
		await writeFile(filePath, JSON.stringify(cache[teamId], null, 4));
		console.log(`✓ Data written to ${filePath}`);
	} catch (err) {
		console.error(`✗ Error writing data to file:`, err.message);
	}
}


// ============================================================================
// MAIN ENTRY POINT
// ============================================================================

async function scrape(teamId) {
	let browser;
	try {
		browser = await chromium.launch({ headless: false });
		// ✅ Create one context (one window)
		const context = await browser.newContext();

		// ✅ First tab in that window
		const page = await context.newPage();
		await executeWorkflow(page, context, teamId);
		// Keep browser open for inspection

	} catch (err) {
		console.error('✗ Fatal error:', err.message);
		process.exitCode = 1;
	}
}

module.exports = { scrape };



