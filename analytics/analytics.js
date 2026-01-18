const { readOnlyFiles } = require("./readDirectories");
const fs = require("fs/promises");

function parseStat(stat) {
  if (!stat || typeof stat !== "string") {
    return { team: 0, opponent: 0 };
  }
  const [nums] = stat.split("[");
  const [team, opponent] = nums.split("/").map(Number);
  return { team, opponent };
}

/**
 * Normalize thresholds:
 * 3     -> [3]
 * [3,4] -> [3,4]
 */
function normalizeThresholds(thresholds) {
  return Array.isArray(thresholds) ? thresholds : [thresholds];
}

/* ===============================
   CORE ANALYTICS ENGINE
================================ */

/**
 * Probability calculator - processes multiple metrics with different thresholds for gte and lt
 * Returns probabilities for both >= and < threshold
 * Single loop through all matches for efficiency
 *
 * @param {object} data - Team data object
 * @param {object|array} config - Single config object or array of config objects
 * @param {object} config.metricsConfig - e.g. {
 *   goalKicks: { gte: [11, 12] },
 *   saves: { gte: 5 },
 *   corners: { gte: 8 },
 *   fouls: { gte: 18 },
 *   throwIns: { gte: 30 },
 *   yellowCards: { gte: [3, 4], lt: [5], scope: "team" },
 *   shotsOnTarget: { gte: [5, 7], scope: "opponent" }
 * }
 * @param {"total"|"team"|"opponent"} config.scope - default scope for all metrics (can be overridden per metric)
 *
 * @returns {object|array}
 */
function probabilityOverAndUnderThreshold(data, config) {
  // Handle array of configs
  if (Array.isArray(config)) {
    return config.map((cfg) => probabilityOverAndUnderThreshold(data, cfg));
  }

  // Handle single config object
  const { metricsConfig, scope = "total" } = config;

  const allMatches = data.matchStatistics;

  if (!allMatches || allMatches.length === 0) {
    return { error: "No matches found" };
  }

  const homeCount = allMatches.filter((m) => m.isHome === true).length;
  const awayCount = allMatches.filter((m) => m.isHome === false).length;
  const totalCount = allMatches.length;

  // Normalize threshold values to arrays
  const normalizeToArray = (val) => (Array.isArray(val) ? val : [val]);

  // Initialize hit counters for each metric, condition, and threshold
  const hitsByMetric = {};
  Object.entries(metricsConfig).forEach(([metric, config]) => {
    hitsByMetric[metric] = { gte: {}, lt: {} };

    if (config.gte !== undefined) {
      const gteThresholds = normalizeToArray(config.gte);
      gteThresholds.forEach((t) => {
        hitsByMetric[metric].gte[t] = { home: 0, away: 0, total: 0 };
      });
    }

    if (config.lt !== undefined) {
      const ltThresholds = normalizeToArray(config.lt);
      ltThresholds.forEach((t) => {
        hitsByMetric[metric].lt[t] = { home: 0, away: 0, total: 0 };
      });
    }
  });

  // Single loop through all matches
  allMatches.forEach((match) => {
    Object.entries(metricsConfig).forEach(([metric, config]) => {
      // Use metric-specific scope or fall back to global scope
      const metricScope = config.scope !== undefined ? config.scope : scope;

      const { team, opponent } = parseStat(match[metric]);
      let value =
        metricScope === "team"
          ? team
          : metricScope === "opponent"
            ? opponent
            : team + opponent;

      // Check gte conditions
      if (config.gte !== undefined) {
        const gteThresholds = normalizeToArray(config.gte);
        gteThresholds.forEach((threshold) => {
          if (value >= threshold) {
            hitsByMetric[metric].gte[threshold].total++;
            if (match.isHome) {
              hitsByMetric[metric].gte[threshold].home++;
            } else {
              hitsByMetric[metric].gte[threshold].away++;
            }
          }
        });
      }

      // Check lt conditions
      if (config.lt !== undefined) {
        const ltThresholds = normalizeToArray(config.lt);
        ltThresholds.forEach((threshold) => {
          if (value < threshold) {
            hitsByMetric[metric].lt[threshold].total++;
            if (match.isHome) {
              hitsByMetric[metric].lt[threshold].home++;
            } else {
              hitsByMetric[metric].lt[threshold].away++;
            }
          }
        });
      }
    });
  });

  const result = {
    scope,
    metrics: {},
  };

  // Build result object
  Object.entries(metricsConfig).forEach(([metric, config]) => {
    const metricScope = config.scope !== undefined ? config.scope : scope;

    result.metrics[metric] = { scope: metricScope };

    if (config.gte !== undefined) {
      const gteThresholds = normalizeToArray(config.gte);
      gteThresholds.forEach((threshold) => {
        result.metrics[metric][`>=${threshold}`] = {
          total: {
            hits: hitsByMetric[metric].gte[threshold].total,
            totalMatches: totalCount,
            probability: Number(
              (hitsByMetric[metric].gte[threshold].total / totalCount).toFixed(
                4,
              ),
            ),
          },
          home: {
            hits: hitsByMetric[metric].gte[threshold].home,
            totalMatches: homeCount,
            probability: homeCount
              ? Number(
                  (
                    hitsByMetric[metric].gte[threshold].home / homeCount
                  ).toFixed(4),
                )
              : 0,
          },
          away: {
            hits: hitsByMetric[metric].gte[threshold].away,
            totalMatches: awayCount,
            probability: awayCount
              ? Number(
                  (
                    hitsByMetric[metric].gte[threshold].away / awayCount
                  ).toFixed(4),
                )
              : 0,
          },
        };
      });
    }

    if (config.lt !== undefined) {
      const ltThresholds = normalizeToArray(config.lt);
      ltThresholds.forEach((threshold) => {
        result.metrics[metric][`<${threshold}`] = {
          total: {
            hits: hitsByMetric[metric].lt[threshold].total,
            totalMatches: totalCount,
            probability: Number(
              (hitsByMetric[metric].lt[threshold].total / totalCount).toFixed(
                4,
              ),
            ),
          },
          home: {
            hits: hitsByMetric[metric].lt[threshold].home,
            totalMatches: homeCount,
            probability: homeCount
              ? Number(
                  (hitsByMetric[metric].lt[threshold].home / homeCount).toFixed(
                    4,
                  ),
                )
              : 0,
          },
          away: {
            hits: hitsByMetric[metric].lt[threshold].away,
            totalMatches: awayCount,
            probability: awayCount
              ? Number(
                  (hitsByMetric[metric].lt[threshold].away / awayCount).toFixed(
                    4,
                  ),
                )
              : 0,
          },
        };
      });
    }
  });

  return result;
}

async function probabilityOverAndUnderThresholdWrapper(data, teamSlug) {
  const result = probabilityOverAndUnderThreshold(data, [
    {
      metricsConfig: {
        goalKicks: { gte: [11, 12] },
        saves: { gte: [6] },
        corners: { gte: [8], lt: [11] },
        fouls: { gte: [18], lt: [24] },
        throwIns: { gte: [30, 34], lte: [28] },
        yellowCards: { gte: [3, 4], lt: [5] },
        shotsOnTarget: { gte: [5, 7] },
      },
      scope: "total",
    },
    {
      metricsConfig: {
        goalKicks: { gte: [6] },
        saves: { gte: [3] },
        yellowCards: { gte: [2] },
        fouls: { gte: [8, 9, 10], lte: [13] },
        throwIns: { gte: [16], lte: [13] },
      },
      scope: "team",
    },
    {
      metricsConfig: {
        goalKicks: { gte: [6] },
        saves: { gte: [3] },
        yellowCards: { gte: [2] },
        fouls: { gte: [8, 9, 10], lte: [13] },
        throwIns: { gte: [16], lte: [13] },
      },
      scope: "opponent",
    },
  ]);

  await fs.writeFile(
    `./teamsData/${teamSlug}_analysis.json`,
    JSON.stringify(result, null, 2),
  );
}

async function runDataAnalytics(teamSlug) {
  const data = await readOnlyFiles(teamSlug);
  await probabilityOverAndUnderThresholdWrapper(data, teamSlug);
  //await fs.writeFile(`./teamsData/${team}_analysis.json`, JSON.stringify(result, null, 2));
}

// runDataAnalytics("ajax").then(async result => {
//     console.log(JSON.stringify(result, null, 2));
//     await fs.writeFile("./analytics/ajax_analysis.json", JSON.stringify(result, null, 2));;

// });

module.exports = { runDataAnalytics, probabilityOverAndUnderThresholdWrapper };
