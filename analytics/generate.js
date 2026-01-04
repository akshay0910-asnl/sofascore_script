const fs = require("fs/promises");
const path = require("path");
const { probabilityOverAndUnderThresholdWrapper } = require("./analytics");

async function readOnlyFiles(dir = "./teamsData") {
    try {
        console.log(`Starting to read files from: ${dir}`);
        const entries = await fs.readdir(dir, { withFileTypes: true });

        // Filter all JSON files
        const matchingFiles = entries.filter(entry => 
            entry.isFile() &&
            entry.name.endsWith(".json")
        );

        console.log(`Found ${matchingFiles.length} JSON files to process`);

        // Process in batches of 10
        const batchSize = 10;
        const totalBatches = Math.ceil(matchingFiles.length / batchSize);
        
        for (let i = 0; i < matchingFiles.length; i += batchSize) {
            const batch = matchingFiles.slice(i, i + batchSize);
            const batchNumber = Math.floor(i / batchSize) + 1;
            
            console.log(`\nStarting batch ${batchNumber}/${totalBatches} (${batch.length} files)`);
            
            // Process all files in this batch in parallel
            await Promise.allSettled(batch.map(async (entry) => {
                const filePath = path.join(dir, entry.name);
                try {
                    const data = JSON.parse(await fs.readFile(filePath, "utf8"));
                    await probabilityOverAndUnderThresholdWrapper(data, data.teamSlug);
                    console.log(`✓ Processed: ${entry.name}`);
                    //return result;
                } catch (err) {
                    console.error(`✗ Error processing ${entry.name}: ${err.message}`);
                }
            }));

            const processedCount = Math.min(i + batchSize, matchingFiles.length);
            console.log(`Batch ${batchNumber} completed: ${processedCount}/${matchingFiles.length} files processed`);
        }
        
        console.log(`\n✓ All ${matchingFiles.length} files processed successfully!`);
    } catch (err) {
        console.error(`Error reading directory: ${err.message}`);
        return;
    }
}

readOnlyFiles().then(() => {
    console.log("Data analytics completed for all files.");
}).catch(err => {
    console.error("Unexpected error during data analytics:", err);
});

