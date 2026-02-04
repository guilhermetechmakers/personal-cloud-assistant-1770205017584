# Personal Cloud Assistant

This project was created with ScopesFlow automation.

## Setup

**Required:** Install dependencies before building or running.

```bash
npm install
```

Or use the setup script:

```bash
npm run setup
```

Then run:

- `npm run dev` — start dev server
- `npm run build` — type-check and build for production (runs `npm install` first if dependencies are missing)

## Build errors: "Cannot find module …"

If the build fails with errors like:

- `Cannot find module 'react-router-dom'`
- `Cannot find module '@tanstack/react-query'`
- `Cannot find module 'sonner'`
- `Cannot find module 'lucide-react'`

then dependencies are not installed. From the project root (in a terminal where Node.js and npm work, e.g. PowerShell or WSL 2), run:

```bash
npm install
```

Then run `npm run build` again.
