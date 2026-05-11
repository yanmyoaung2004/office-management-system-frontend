# syntax=docker/dockerfile:1

ARG NODE_VERSION=20.14.0

################################################################################
FROM node:${NODE_VERSION}-alpine AS base
WORKDIR /usr/src/app

################################################################################
FROM base AS deps
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev

################################################################################
FROM deps AS build

# --- ARG SECTION START ---
# Declare the argument in the build stage so Next.js can see it
ARG NEXT_PUBLIC_API_BASE_URL
# Set it as an environment variable for the build process
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
# --- ARG SECTION END ---

RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci

COPY . .
RUN npm run build

################################################################################
FROM base AS final

ENV NODE_ENV=production
USER node

COPY package.json .

# Next.js specific production files
COPY --from=build /usr/src/app/public ./public
COPY --from=build /usr/src/app/.next ./.next
COPY --from=deps /usr/src/app/node_modules ./node_modules

EXPOSE 3000

# Use JSON array for CMD to handle OS signals correctly
CMD ["npm", "start"]