## Security Policy

- No secrets or credentials in code
- Environment variables for all API keys
- Input validation on all external data
- Dependency audit on install (npm audit)
- No eval() or Function() constructors
- Sanitize all outputs (HTML, SQL, shell)
- HTTPS for all external API calls
- Rate limiting on public endpoints
- CORS restricted to known origins
