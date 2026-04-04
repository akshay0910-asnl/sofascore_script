# IP Rotation Guide - SofaScore Script

Your script now automatically rotates IPs every 10-15 requests with random delays between scrapes. Here's how to configure it:

## Quick Setup

Your script is ready to use! It will:

- ✅ Rotate proxies every 10-15 teams automatically
- ✅ Add 3-7 second delays between requests
- ✅ Add 20-40 second delays when rotating proxies
- ✅ Appear more human-like to SofaScore

## Option 1: Using Free Rotating Proxies (Simple)

### Easiest Way - Auto Updater Script

1. Run the proxy updater:

```bash
node updateProxies.js
```

2. Go to [free-proxy-list.net](https://free-proxy-list.net/)
3. Filter for "anonymous" or "elite proxy" proxies (high anonymity)
4. Select some proxies and copy IP:PORT (e.g., `202.58.77.77:1111`)
5. Paste them when prompted in the terminal (one per line, hit Enter twice when done)
6. Script automatically updates `proxyRotation.js`

### Manual Way

1. Get proxies from [free-proxy-list.net](https://free-proxy-list.net/) (copy IP and Port separately)
2. Edit `proxyRotation.js` and add proxies to `PROXY_LIST`:

```javascript
const PROXY_LIST = [
  "http://202.58.77.77:1111",
  "http://46.17.47.48:80",
  "http://4.195.16.140:80",
  "http://143.42.66.91:80",
  // Add more...
];
```

### Pro Tips for free-proxy-list.net

- ✅ Filter by "Anonymity" = "anonymous" or "elite proxy"
- ✅ Sort by "Last Checked" (most recent are more reliable)
- ✅ Use 10-15 proxies minimum for rotation to work well
- ⚠️ Free proxies can die quickly - update weekly
- 🔧 Mix different ports (8080, 3128, 80, etc.) for better success

## Option 2: Using Bright Data (Recommended - Most Reliable)

1. Sign up at https://brightdata.com
2. Create a proxy zone and get your credentials
3. Edit `proxyRotation.js`:

```javascript
const PROXY_SERVICE_CONFIG = {
  enabled: true,
  provider: "bright-data",
  proxyUrl:
    "http://brd-customer-YOUR_CUSTOMER_ID-zone-YOUR_ZONE_NAME:YOUR_PASSWORD@brd.superproxy.io:22225",
};
```

## Option 3: Using ScraperAPI (Budget-Friendly)

1. Sign up at https://www.scraperapi.com
2. Get your API key
3. Edit `proxyRotation.js`:

```javascript
const PROXY_SERVICE_CONFIG = {
  enabled: true,
  provider: "scraperapi",
  proxyUrl: "http://scraperapi:YOUR_API_KEY@proxy.scraperapi.com:8001",
};
```

## Option 4: Using Oxylabs (Premium)

1. Sign up at https://oxylabs.io
2. Get username/password from dashboard
3. Edit `proxyRotation.js`:

```javascript
const PROXY_SERVICE_CONFIG = {
  enabled: true,
  provider: "oxylabs",
  proxyUrl: "http://YOUR_USERNAME:YOUR_PASSWORD@pr.oxylabs.io:7777",
};
```

## How the Rotation Works

- **Request Counter**: Every scrape increments a counter
- **Rotation Trigger**: After 10-15 requests (randomized), proxy rotates
- **Extended Delay**: 20-40 second delay added after rotation to be extra safe
- **Per-Request Delay**: 3-7 second random delay between all requests for human-like behavior

## Configuration in `proxyRotation.js`

```javascript
// Change rotation frequency (default: 10-15 teams per IP)
const proxyRotator = new ProxyRotator(12); // Rotate every 12 requests
```

## Testing Your Setup

Run with logging to see proxy rotation in action:

```bash
node playwright/main.js
```

You should see output like:

```
📍 Processing team 1/2: 11
🔐 Using proxy for team 11
⏸️  Waiting 5.2s to avoid detection...
📊 Reached 12 requests with current proxy. Time to rotate!
🔄 Proxy rotated to: http://1.10.130.125:9999 (2/10)
⏳ Proxy rotation delay: 25.3s
```

## Troubleshooting

### Still getting captchas?

- **Increase delay**: Modify randomization in `main.js` to 5-10 seconds
- **Use more proxies**: Add more IPs to reduce requests per proxy
- **Use premium service**: Switch to Bright Data or Oxylabs for residential proxies

### Proxy not working?

- Test proxy in browser: `curl -x http://proxy:port http://example.com`
- Check proxy credentials are correct
- Some proxies require headers or authentication

### Performance too slow?

- Reduce requests per proxy: `new ProxyRotator(8)` instead of 10-15
- Use fewer teams per batch
- Consider parallel processing (commented code in main.js)

## Best Practices

✅ **DO:**

- Add 2000+ millisecond delays between requests
- Rotate proxies frequently (every 10-20 requests)
- Use residential proxies for better success rates
- Monitor for captcha patterns and adjust delays

❌ **DON'T:**

- Make requests too fast (< 1 second apart)
- Reuse same IP for too many requests
- Ignore robots.txt or website ToS
- Use same proxy list as others

## Cost Estimate

| Service      | Cost                   | Monthly             |
| ------------ | ---------------------- | ------------------- |
| Free Proxies | $0                     | $0                  |
| ScraperAPI   | $0.01/request          | ~$30 (10k requests) |
| Bright Data  | ~$300/GB               | ~$30-50             |
| Oxylabs      | Similar to Bright Data | ~$40-60             |

## Next Steps

1. Choose a proxy option above
2. Configure `proxyRotation.js`
3. Test with 2-3 teams first: `processBatches(["11", "27"])`
4. Scale up once working reliably
