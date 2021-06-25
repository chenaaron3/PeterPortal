FROM node:14

# Install server dependencies
WORKDIR /usr/src/app/server
COPY server/package*.json ./
RUN npm install

# Install client dependencies
WORKDIR /usr/src/app/client
COPY client/package*.json ./
RUN npm install

# Copy source code
WORKDIR /usr/src/app
COPY . ./

# Build client
WORKDIR /usr/src/app/client
RUN npm run build
RUN mv /usr/src/app/client/build /usr/src/app/server

# Start server
EXPOSE 8080
WORKDIR /usr/src/app/server
CMD ["npm", "start"]