# Compile typescript to dist folder
FROM node:16-alpine3.11 as builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY tsconfig*.json ./
COPY src src
RUN npm run build

# Run the dist from builder
FROM node:16-alpine3.11
RUN apk add --no-cache tzdata
ENV TZ Asia/Jakarta
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY --from=builder /usr/src/app/dist/ dist/
CMD ["npm", "start"]
