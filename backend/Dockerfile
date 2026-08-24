# Install production dependencies
FROM node:13-alpine AS dependencies

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev


# Create the final application image
FROM node:13-alpine

WORKDIR /app

COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

EXPOSE 5000

CMD ["npm", "start"]