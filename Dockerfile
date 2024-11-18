# Use official Node.js LTS image
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./

RUN npm install --only=production

# Bundle app source
COPY . .

# Expose port (optional, as port is defined in Task Definition)
EXPOSE 3000

# Define environment variables (can also be set via ECS)
ENV PORT=3000

# Start the application
CMD ["node", "app.js"]
