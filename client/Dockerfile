# Build the React application
FROM node:13-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN ./node_modules/.bin/react-scripts build


# Serve the production build
FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]