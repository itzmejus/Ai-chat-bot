FROM node:24-alpine AS base
WORKDIR /app

# Install dependencies first so this layer is cached between code changes.
# The Prisma schema is needed because `postinstall` runs `prisma generate`.
COPY package.json package-lock.json prisma.config.ts ./
COPY prisma ./prisma
RUN npm ci

COPY . .
RUN npm run build

ENV NODE_ENV=production
EXPOSE 3000
CMD ["npm", "start"]
