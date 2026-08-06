# Dependencies with Bun (fast install)
FROM oven/bun:1-alpine AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Build environment (react-scripts/webpack on Node)
FROM node:20-alpine AS build
WORKDIR /app
ENV PATH=/app/node_modules/.bin:$PATH
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN node scripts/patch-rc-components.js && npm run build

# Production environment
FROM nginx:stable-alpine
COPY --from=build /app/build /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf
COPY conf/nginx-react.conf /etc/nginx/conf.d
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
