# Environment Configuration Guide

## Frontend Environment Variables

The frontend application requires environment variables to function properly. These variables control API endpoints, feature flags, and other configuration settings.

### Required Environment Variables

Create a `.env` file in the root directory with the following variables:

```
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_API_TIMEOUT=30000

# Feature Flags
NEXT_PUBLIC_ENABLE_VOICE_INTERFACE=true
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true
NEXT_PUBLIC_DEBUG_MODE=true

# UI Configuration
NEXT_PUBLIC_DEFAULT_THEME=light
NEXT_PUBLIC_DEFAULT_LANGUAGE=pt-BR

# Authentication (if applicable)
NEXT_PUBLIC_AUTH_DOMAIN=localhost
NEXT_PUBLIC_AUTH_CLIENTID=local_development
```

### Environment-Specific Files

You can create different environment files for different deployment environments:

- `.env.development` - Used during local development
- `.env.production` - Used for production builds
- `.env.staging` - Used for staging environment

### Accessing Environment Variables

In your Next.js code, access these variables using:

```javascript
// For Next.js projects
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
```

### Troubleshooting

If your changes aren't appearing after adding environment variables:

1. Make sure to restart your Next.js development server
2. Make sure all environment variables intended for client-side use are prefixed with `NEXT_PUBLIC_`
3. Remember that environment variables without the `NEXT_PUBLIC_` prefix are only available server-side

Remember: In Next.js, only variables prefixed with `NEXT_PUBLIC_` are available in the browser!
