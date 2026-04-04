/**
 * Proxy rotation system to avoid IP blocking
 * Rotates proxies every N requests to evade rate limiting and captchas
 */

// Free rotating proxy services - Add proxies from free-proxy-list.net
// Format: "http://proxy-ip:port" or "http://username:password@proxy-ip:port"
// Get proxies from: https://free-proxy-list.net/
const PROXY_LIST = [
  // Recent working proxies (update regularly from free-proxy-list.net)
  "http://202.58.77.77:1111",
  "http://46.17.47.48:80",
  "http://4.195.16.140:80",
  "http://143.42.66.91:80",
  "http://65.21.90.27:687",
  "http://174.138.119.88:80",
  "http://176.126.164.213:80",
  "http://133.18.234.13:80",
  "http://91.132.92.231:80",
  "http://32.223.6.94:80",

  // ADD MORE PROXIES HERE from https://free-proxy-list.net/
  // Copy format: "http://IP:PORT",
];

// If using a paid service like Bright Data, ScraperAPI, etc., configure here
const PROXY_SERVICE_CONFIG = {
  enabled: false, // Set to true to use a service
  provider: "bright-data", // "bright-data", "scraperapi", "oxylabs", etc.
  // For Bright Data: "http://brd-customer-XXXX-zone-XXXX:XXXX@brd.superproxy.io:22225"
  // For ScraperAPI: "http://scraperapi:XXXX@proxy.scraperapi.com:8001"
  proxyUrl: "",
};

class ProxyRotator {
  constructor(maxRequestsPerProxy = 10) {
    this.proxies = PROXY_LIST.filter((p) => p.trim().length > 0);
    this.currentProxyIndex = 0;
    this.requestCount = 0;
    this.maxRequestsPerProxy = maxRequestsPerProxy;
    this.sessionStartTime = Date.now();

    if (!this.proxies.length && !PROXY_SERVICE_CONFIG.enabled) {
      console.warn(
        "⚠️  No proxies configured. IP rotation disabled. Consider adding proxies to avoid captchas.",
      );
    }
  }

  /**
   * Get the current proxy URL
   */
  getCurrentProxy() {
    if (PROXY_SERVICE_CONFIG.enabled && PROXY_SERVICE_CONFIG.proxyUrl) {
      return PROXY_SERVICE_CONFIG.proxyUrl;
    }

    if (this.proxies.length === 0) {
      return null;
    }

    return this.proxies[this.currentProxyIndex];
  }

  /**
   * Rotate to next proxy and return it
   */
  rotateProxy() {
    if (this.proxies.length === 0 && !PROXY_SERVICE_CONFIG.enabled) {
      return null;
    }

    if (this.proxies.length > 0) {
      this.currentProxyIndex =
        (this.currentProxyIndex + 1) % this.proxies.length;
      console.log(
        `🔄 Proxy rotated to: ${this.proxies[this.currentProxyIndex]} (${this.currentProxyIndex + 1}/${this.proxies.length})`,
      );
    }

    this.requestCount = 0; // Reset counter after rotation
    return this.getCurrentProxy();
  }

  /**
   * Increment request counter and check if rotation is needed
   */
  incrementAndCheckRotation() {
    this.requestCount++;

    if (this.requestCount >= this.maxRequestsPerProxy) {
      console.log(
        `📊 Reached ${this.maxRequestsPerProxy} requests with current proxy. Time to rotate!`,
      );
      return true;
    }

    return false;
  }

  /**
   * Get proxy configuration object for Playwright
   */
  getPlaywrightProxyConfig() {
    const proxy = this.getCurrentProxy();

    if (!proxy) {
      return undefined;
    }

    // Parse proxy URL
    try {
      const url = new URL(proxy.startsWith("http") ? proxy : `http://${proxy}`);
      const config = {
        server: `${url.protocol}//${url.hostname}:${url.port || 8080}`,
      };

      if (url.username && url.password) {
        config.username = url.username;
        config.password = url.password;
      }

      return config;
    } catch (e) {
      console.error("❌ Invalid proxy URL format:", proxy);
      return undefined;
    }
  }

  /**
   * Add random delay to avoid detection (2-8 seconds)
   */
  async addRandomDelay(min = 2000, max = 8000) {
    const delay = Math.random() * (max - min) + min;
    console.log(
      `⏸️  Waiting ${(delay / 1000).toFixed(1)}s to avoid detection...`,
    );
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  /**
   * Get session stats
   */
  getStats() {
    return {
      totalProxies: this.proxies.length,
      currentProxyIndex: this.currentProxyIndex,
      requestsWithCurrentProxy: this.requestCount,
      sessionDuration: Date.now() - this.sessionStartTime,
    };
  }
}

module.exports = { ProxyRotator };
