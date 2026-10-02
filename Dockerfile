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

# Apply any pending database migrations, then start the server.
# Requires DATABASE_URL and DIRECT_URL (plus the other variables in .env.example) at runtime.
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
