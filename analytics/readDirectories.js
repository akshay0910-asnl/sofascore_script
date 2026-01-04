const fs = require("fs/promises");
const path = require("path");

async function readOnlyFiles(substr,  dir = "./teamsData") {
    try {
        const entries = await fs.readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
            if (
                entry.isFile() &&
                entry.name.startsWith(substr) &&
                entry.name.endsWith(".json")
            ) {
                const filePath = path.join(dir, entry.name);
                const data = JSON.parse(await fs.readFile(filePath, "utf8"));
                return data;
            }
        }
    } catch (err) {
        return;
    }
}

module.exports = { readOnlyFiles };