# Security and data handling

- Never commit Instagram access tokens, Graph API Explorer URLs containing tokens, credentials, or Script Properties exports.
- Store `INSTAGRAM_ACCESS_TOKEN` in Apps Script **Script Properties**.
- Configure spreadsheet and Instagram account IDs via Script Properties; do not hardcode operational identifiers into a public repository.
- Do not log access tokens, Authorization headers, or full error objects that could contain secrets.
- Rotate any token previously exposed in screenshots, URLs, logs, or commits.
- Limit Google Sheet sharing and review permissions before publishing screenshots.
- Respect Meta Graph API rate limits, supported endpoints, and access permissions. Do not scrape around API restrictions.
- The source here is a **sanitized reference**. Verify and test against your authorized account before deployment.
