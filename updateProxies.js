#!/usr/bin/env node
/**
 * Fetch free proxies from free-proxy-list.net and update proxyRotation.js
 * Run: node updateProxies.js
 */

const https = require("https");
const fs = require("fs");
const path = require("path");

// Note: free-proxy-list.net doesn't have an easy API
// This script provides a manual paste option with validation

function validateProxy(proxyString) {
  // Check if it's valid IP:PORT format
  const proxyRegex = /^(\d{1,3}\.){3}\d{1,3}:\d+$/;
  return proxyRegex.test(proxyString);
}

function formatProxyList(proxyStrings) {
  return proxyStrings.map((proxy) => `  "http://${proxy}",`).join("\n");
}

// Simple interactive mode
async function interactiveMode() {
  console.log("📋 Proxy List Updater");
  console.log("====================\n");
  console.log("Steps:");
  console.log("1. Go to https://free-proxy-list.net/");
  console.log(
    '2. Select proxies with high anonymity ("anonymous" or "elite proxy")',
  );
  console.log("3. Copy the proxy list (IP:PORT format)");
  console.log("4. Paste below (one per line, empty line to finish):\n");

  const readline = require("readline");
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const proxies = [];

  const askForProxy = () => {
    rl.question(`Proxy ${proxies.length + 1}: `, (answer) => {
      if (!answer.trim()) {
        // Empty line = done
        if (proxies.length === 0) {
          console.log("❌ No proxies entered!");
          rl.close();
          return;
        }
        updateProxyFile(proxies);
        rl.close();
        return;
      }

      if (validateProxy(answer.trim())) {
        proxies.push(answer.trim());
        askForProxy();
      } else {
        console.log("❌ Invalid format! Use: 1.2.3.4:8080");
        askForProxy();
      }
    });
  };

  askForProxy();
}

function updateProxyFile(proxyList) {
  const proxyRotationPath = path.join(
    __dirname,
    "playwright",
    "proxyRotation.js",
  );

  if (!fs.existsSync(proxyRotationPath)) {
    console.error("❌ proxyRotation.js not found!");
    process.exit(1);
  }

  let content = fs.readFileSync(proxyRotationPath, "utf8");

  // Extract existing comments and format
  const formattedProxies = formatProxyList(proxyList);

  // Replace PROXY_LIST array
  const newContent = content.replace(
    /const PROXY_LIST = \[[\s\S]*?\];/,
    `const PROXY_LIST = [\n${formattedProxies}\n];`,
  );

  fs.writeFileSync(proxyRotationPath, newContent, "utf8");

  console.log(
    `\n✅ Updated proxyRotation.js with ${proxyList.length} proxies!`,
  );
  console.log("\nUpdated proxies:");
  proxyList.forEach((proxy, i) => {
    console.log(`  ${i + 1}. ${proxy}`);
  });

  console.log("\n🚀 Ready to run: node playwright/main.js");
}

// Check for command line arguments
if (process.argv[2] === "--help") {
  console.log("Usage:");
  console.log("  node updateProxies.js              - Interactive mode");
  console.log(
    "  node updateProxies.js <file>       - Read proxies from file (one per line)",
  );
} else if (process.argv[2]) {
  // Read from file
  const filePath = process.argv[2];
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    process.exit(1);
  }

  const content = fs.readFileSync(filePath, "utf8");
  const proxies = content
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && validateProxy(line));

  if (proxies.length === 0) {
    console.error("❌ No valid proxies found in file!");
    console.error("Expected format: IP:PORT (one per line)");
    process.exit(1);
  }

  updateProxyFile(proxies);
} else {
  // Interactive mode
  interactiveMode();
}
