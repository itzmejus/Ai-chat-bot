FROM node:24-alpine
WORKDIR /app

# Install dependencies first so this layer is cached between code changes.
# The Prisma schema is needed because `postinstall` runs `prisma generate`.
COPY package.json package-lock.json prisma.config.ts ./
COPY prisma ./prisma
RUN npm ci

COPY . .
# The build needs no secrets: nothing connects to the database or OpenAI at build time.
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

ENV NODE_ENV=production
# The platform (Render) provides PORT; 3000 is the local default.
EXPOSE 3000

# Run as the unprivileged "node" user that the base image provides, not as root, so a flaw in
# the app cannot change its own files or the system. Only the build output (Next.js keeps its
# cache there) and the tools' cache folder need to be writable.
RUN mkdir -p /app/node_modules/.cache && chown -R node:node /app/.next /app/node_modules/.cache
USER node

# Apply any pending database migrations, then start the server.
# Requires DATABASE_URL and DIRECT_URL (plus the other variables in .env.example) at runtime.
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
