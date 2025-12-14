

const MyAxios = require('./config');
const myAxios = new MyAxios();
const fs = require('fs');
const path = require('path');

const getRefererUrl = (teamId, slug) => `https://www.sofascore.com/team/football/${slug}/${teamId}`;

const getSeasonsUrl = (teamId) => `https://www.sofascore.com/api/v1/team/${teamId}/player-statistics/seasons`;

const getStatisticsUrl = (teamId, seasonId, tournamentId) => `https://www.sofascore.com/api/v1/team/${teamId}/unique-tournament/${tournamentId}/season/${seasonId}/statistics/overall`;

const getTeamEventsUrl = (teamId) => `https://www.sofascore.com/api/v1/team/${teamId}/events/last/0`;

const getEventsMetadataUrl = (eventId) => `https://www.sofascore.com/api/v1/event/${eventId}`;

const getEventsStatisticsUrl = (eventId) => `https://www.sofascore.com/api/v1/event/${eventId}/statistics`;

const getStatisticsInfo = async (teamId, seasonId, tournamentId, slug) => {

    const statistics = await myAxios.get(getStatisticsUrl(teamId, seasonId, tournamentId), getRefererUrl(teamId, slug));

    const { statistics: { corners, fouls, goalKicks, saves, offsides, shotsOnTarget, shotsOnTargetAgainst,
        yellowCards, yellowCardsAgainst, goalsConceded, goalsScored, matches, throwIns, averageBallPossession,
        tackles, tacklesAgainst, interceptions, interceptionsAgainst, aerialDuelsWon, totalAerialDuels,
        dribbleAttemptsWonAgainst, successfulDribbles, dribbleAttempts, dribbleAttemptsTotalAgainst
    } } = statistics;

    const result = {
        corners: (corners / matches).toFixed(2),
        fouls: (fouls / matches).toFixed(2),
        goalKicks: (goalKicks / matches).toFixed(2),
        saves: (saves / matches).toFixed(2),
        offsides: (offsides / matches).toFixed(2),
        shotsOnTarget: `${(shotsOnTarget / matches).toFixed(2)}/${(shotsOnTargetAgainst / matches).toFixed(2)}`,
        yellowCards: `${(yellowCards / matches).toFixed(2)}/${(yellowCardsAgainst / matches).toFixed(2)}`,
        goals: `${(goalsScored / matches).toFixed(2)}/${(goalsConceded / matches).toFixed(2)}`,
        throwIns: (throwIns / matches).toFixed(2),
        averageBallPossession,
        tackles: `${(tackles / matches).toFixed(2)}/${(tacklesAgainst / matches).toFixed(2)}`,
        interceptions: `${(interceptions / matches).toFixed(2)}/${(interceptionsAgainst / matches).toFixed(2)}`,
        aerialDuels: `${(aerialDuelsWon / matches).toFixed(2)}`,
        aerialDuelsTotal: `${(totalAerialDuels / matches).toFixed(2)}`,
        dribbles: `${(successfulDribbles / matches).toFixed(2)}/${(dribbleAttemptsWonAgainst / matches).toFixed(2)}`,
        dribblesTotal: `${(dribbleAttempts / matches).toFixed(2)}/${(dribbleAttemptsTotalAgainst / matches).toFixed(2)}`
    }

    return result;
}


const getLatestEvents = async (teamId, seasonId, tournamentId, slug) => {
    const events = await myAxios.get(getTeamEventsUrl(teamId), getRefererUrl(teamId, slug));
    let counts = 0;
    const eventIds = []

    const { events: matchEvents } = events;
    const newEvents = matchEvents.reverse();

    try {
        for (let i = 0; i < newEvents.length; i++) {
            if (counts === 8) {
                break;
            }

            const event = newEvents[i];
            const { tournament: { uniqueTournament },
                season,
                homeTeam: { name: homeTeamName, id: homeTeamId }, homeScore: { normaltime: homeScore },
                awayTeam: { name: awayTeamName, id: awayTeamId }, awayScore: { normaltime: awayScore },
                status: { type }, isAwarded } = event;

            if (!uniqueTournament) {
                continue;
            }


            if (uniqueTournament.id === tournamentId && season.id === seasonId && type !== 'inprogress' && type !== 'postponed' && !isAwarded) {
                const isHomeTeam = teamId == homeTeamId;
                eventIds.push({
                    id: event.id,
                    goals: isHomeTeam ? `${homeScore}/${awayScore}` : `${awayScore}/${homeScore}`,
                    teams: isHomeTeam ? [homeTeamName, awayTeamName, 'Home'] : [awayTeamName, homeTeamName, 'Away'],
                    isHomeTeam
                });
                counts++;
            }
        }
    }
    catch (err) {
        console.error(err)
    }


    return eventIds;

}

const parseEvents = async (event, teamId, slug) => {



    //const isHomeTeam = teamId === homeTeamId;
    try {

        const eventStatistics = await myAxios.get(getEventsStatisticsUrl(event.id), getRefererUrl(teamId, slug))

        const result = {
            corners: 0,
            fouls: 0,
            goalKicks: 0,
            saves: 0,
            offsides: 0,
            shotsOnTarget: 0,
            yellowCards: 0,
            goals: event.goals,
            throwIns: 0,
            averageBallPossession: 0,
            teams: event.teams,
            tackles: 0,
            interceptions: 0,
            aerialDuels: 0,
            aerialDuelsTotal: 0,
            dribbles: 0,
            dribblesTotal: 0
        }


        const { statistics } = eventStatistics
        const allStatistics = statistics.find((x) => x.period === 'ALL')

        for (const group of allStatistics.groups) {
            const { statisticsItems } = group
            for (const item of statisticsItems) {
                const { name, awayValue, homeValue, awayTotal, homeTotal } = item;
                switch (name) {
                    case 'Corner kicks': {
                        result.corners = event.isHomeTeam ? `${homeValue || 0}/${awayValue || 0}[H]` : `${awayValue || 0}/${homeValue || 0}[A]`
                        break;
                    }
                    case `Ball possession`: {
                        result.averageBallPossession = event.isHomeTeam ? `${homeValue || 0}/${awayValue || 0}[H]` : `${awayValue || 0}/${homeValue || 0}[A]`
                        break;
                    }
                    case `Fouls`: {
                        result.fouls = event.isHomeTeam ? `${homeValue || 0}/${awayValue || 0}[H]` : `${awayValue || 0}/${homeValue || 0}[A]`
                        break;
                    }
                    case `Goal kicks`: {
                        result.goalKicks = event.isHomeTeam ? `${homeValue || 0}/${awayValue || 0}[H]` : `${awayValue || 0}/${homeValue || 0}[A]`
                        break;
                    }
                    case `Total saves`: {
                        result.saves = event.isHomeTeam ? `${homeValue || 0}/${awayValue || 0}[H]` : `${awayValue || 0}/${homeValue || 0}[A]`
                        break;
                    }
                    case `Offsides`: {
                        result.offsides = event.isHomeTeam ? `${homeValue || 0}/${awayValue || 0}[H]` : `${awayValue || 0}/${homeValue || 0}[A]`
                        break;
                    }
                    case `Shots on target`: {
                        result.shotsOnTarget = event.isHomeTeam ? `${homeValue || 0}/${awayValue || 0}[H]` : `${awayValue || 0}/${homeValue || 0}[A]`
                        break;
                    }
                    case `Yellow cards`: {
                        result.yellowCards = event.isHomeTeam ? `${homeValue || 0 || 0}/${awayValue || 0 || 0}[H]` : `${awayValue || 0 || 0}/${homeValue || 0 || 0}[A]`
                        break;
                    }
                    case `Throw-ins`: {
                        result.throwIns = event.isHomeTeam ? `${homeValue || 0}/${awayValue || 0}[H]` : `${awayValue || 0}/${homeValue || 0}[A]`
                        break;
                    }
                    case `Tackles`: {
                        result.tackles = event.isHomeTeam ? `${homeValue || 0}/${awayValue || 0}[H]` : `${awayValue || 0}/${homeValue || 0}[A]`
                        break;
                    }
                    case `Interceptions`: {
                        result.interceptions = event.isHomeTeam ? `${homeValue || 0}/${awayValue || 0}[H]` : `${awayValue || 0}/${homeValue || 0}[A]`
                        break;
                    }
                    case `Aerial duels`: {
                        result.aerialDuels = event.isHomeTeam ? `${homeValue || 0}/${awayValue || 0}[H]` : `${awayValue || 0}/${homeValue || 0}[A]`
                        result.aerialDuelsTotal = event.isHomeTeam ? `${homeTotal || 0}/${awayTotal || 0}` : `${awayTotal || 0}/${homeTotal || 0}`
                        break;
                    }
                    case 'Dribbles': {
                        result.dribbles = event.isHomeTeam ? `${homeValue || 0}/${awayValue || 0}[H]` : `${awayValue || 0}/${homeValue || 0}[A]`
                        result.dribblesTotal = event.isHomeTeam ? `${homeTotal || 0}/${awayTotal || 0}` : `${awayTotal || 0}/${homeTotal || 0}`
                        break;
                    }
                    default: {
                        break;
                    }
                }
            }
        }

        return result;
    }
    catch (err) {
        //console.log(err);
        console.log(JSON.stringify(event), teamId, slug);
        return {}
    }
}

const getTeamInfo = async (teamId, slug, tournamentName) => {
    try {
        const seasonAndTournamentInfo = await myAxios.get(getSeasonsUrl(teamId), getRefererUrl(teamId, slug));
        const { uniqueTournamentSeasons } = seasonAndTournamentInfo;
        const firstElement = uniqueTournamentSeasons.find(x =>
            x?.uniqueTournament?.name.toLowerCase().includes(tournamentName.toLowerCase())
        )
        //const firstElement = uniqueTournamentSeasons[0];
        const { seasons, uniqueTournament } = firstElement;
        const [{ id: seasonId }, ...restOfSeasons] = seasons;
        const { id: tournamentId } = uniqueTournament;
        const [statsInfo] = await Promise.all([getStatisticsInfo(teamId, seasonId, tournamentId, slug)]);
        const events = await getLatestEvents(teamId, seasonId, tournamentId, slug);

        const eventsData = await Promise.all(events.map(event => parseEvents(event, teamId, slug)));
        const result = eventsData.reduce((acc, curr) => {
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

        const resultModified = Object.entries(result).reduce((acc, [key, value]) => {
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
            if (key !== 'teams') {
                acc[`${key}Totals`] = `${numeratorCount}/${denominatorCount}`;
                acc[`${key}TotalsHome`] = `${numeratorCountHome}/${denominatorCountHome}`;
                acc[`${key}TotalsAway`] = `${numeratorCountAway}/${denominatorCountAway}`;
                acc[`${key}Average`] = `${(numeratorCount / count).toFixed(2)}/${(denominatorCount / count).toFixed(2)}`;
                acc[`${key}AverageHome`] = `${(numeratorCountHome / countHome).toFixed(2)}/${(denominatorCountHome / countHome).toFixed(2)}`;
                acc[`${key}AverageAway`] = `${(numeratorCountAway / countAway).toFixed(2)}/${(denominatorCountAway / countAway).toFixed(2)}`;
            }
            return acc;

        }, { ...result });

        const punchedStats = {
            team: slug,
            stats: statsInfo,
            recentStats: resultModified,
        }

        fs.writeFileSync(`${path.join(__dirname, `..`, `teamsDataToday`, `${slug}.json`)}`, JSON.stringify(punchedStats), null, 4);

        return punchedStats
    }
    catch (error) {
        throw error
    }
}


const func = (ele) => {
    const href = ele.querySelector(`a`).getAttribute(`href`);
    const segments = href.split(`/`);
    const teamId = segments[segments.length - 1];
    const slug = segments[segments.length - 2];
    return [teamId.toString(), slug]

}

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

function slugify(text) {
    return text
        .toString()
        .normalize('NFD')                  // Normalize Unicode to decompose accents
        .replace(/[\u0300-\u036f]/g, '')   // Remove accent marks
        .toLowerCase()
        .trim()
        .replace(/[\s\W-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function getElementsBetween(temp1, temp2) {
    // Ensure temp1 is before temp2 in the DOM
    if (temp1.compareDocumentPosition(temp2) & Node.DOCUMENT_POSITION_PRECEDING) {
        [temp1, temp2] = [temp2, temp1];
    }

    const elementsInBetween1 = [], elementsInBetween2 = [];
    let currentNode = temp1.nextElementSibling;

    while (currentNode && currentNode !== temp2) {
        if (currentNode.querySelector(`div[data-testid="left_team"] img`) != null) {
            const teamId = splits(currentNode.querySelector(`div[data-testid="left_team"] img`).getAttribute(`src`));
            const teamSlug = slugify(currentNode.querySelector(`div[data-testid="left_team"] img`).getAttribute(`alt`))
            elementsInBetween1.push({ teamId, teamSlug });
        }
        currentNode = currentNode.nextElementSibling;
    }

    currentNode = temp1.nextElementSibling;

    while (currentNode && currentNode !== temp2) {
        if (currentNode.querySelector(`div[data-testid="right_team"] img`) != null) {
            const teamId = splits(currentNode.querySelector(`div[data-testid="right_team"] img`).getAttribute(`src`));
            const teamSlug = slugify(currentNode.querySelector(`div[data-testid="right_team"] img`).getAttribute(`alt`))
            elementsInBetween2.push({ teamId, teamSlug });
        }
        currentNode = currentNode.nextElementSibling;
    }

    let result = [];

    for (let i = 0; i < elementsInBetween1.length; i++) {
        result = [...result,
        elementsInBetween1[i].teamId, elementsInBetween1[i].teamSlug,
        elementsInBetween2[i].teamId, elementsInBetween2[i].teamSlug
        ];
    }

    return result;
}

function whatever(leagueName, result) {
    for (let i = 0; i < result.length; i += 2) {
        getTeamInfo(result[i], result[i + 1], leagueName)
            .then((res) => {
                console.log(JSON.stringify(res))
            })
            .catch((err) => {
                console.log(err);
            })
    }
}

whatever('Sto',
    ['3252', 'aris-thessaloniki', '3250', 'aek-athens', '6342', 'asteras-aktor', '6347', 'mgs-panserraikos', '3255', 'athens-kallithea-fc', '3251', 'paok', '5062', 'atromitos-athens', '3248', 'panathinaikos', '3245', 'olympiacos-fc', '3241', 'ofi-crete', '120154', 'pas-lamia-1964', '267459', 'nps-volos', '7004', 'panetolikos', '5063', 'apo-levadiakos']
)



