# Security Policy

## Reporting Security Vulnerabilities

**Please do not report security vulnerabilities through public GitHub issues.**

If you discover a security vulnerability in xavyo-web, please report it privately:

**Email:** pascal@heartbit.ai

Include in your report:
- Description of the vulnerability
- Steps to reproduce
- Affected versions
- Potential impact

## Response Timeline

| Severity | Initial Response | Fix Target |
|----------|------------------|------------|
| Critical | 24 hours | 48 hours |
| High | 48 hours | 1 week |
| Medium | 1 week | 2 weeks |
| Low | 2 weeks | Next release |

## Supported Versions

| Version | Supported |
|---------|-----------|
| 0.1.x | Yes |

## Security Best Practices

When deploying xavyo-web:

1. **Use TLS** — Always run behind HTTPS in production
2. **HttpOnly cookies** — Session tokens are stored in HttpOnly cookies by default; do not expose them to client-side JavaScript
3. **Environment variables** — Never commit `.env` files; use secrets management
4. **CSP headers** — Configure Content-Security-Policy headers appropriate for your deployment
5. **Keep updated** — Apply security patches promptly

## Acknowledgments

We thank security researchers who responsibly disclose vulnerabilities. Contributors will be credited in release notes (unless they prefer anonymity).
