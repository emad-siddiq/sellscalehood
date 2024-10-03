# Development stage
FROM node:14 as development

WORKDIR /app

# Copy package.json
COPY package.json ./

# Copy package-lock.json if it exists
COPY package-lock.json* ./

# Install dependencies
RUN npm install

# Copy the rest of the code
COPY . .

# Expose ports for the development server and debugging
EXPOSE 3000 9229

# Command to run the development server
CMD ["npm", "start"]

# Build stage
FROM development as build

# Build the app
RUN npm run build

# Production stage
FROM nginx:alpine as production
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]