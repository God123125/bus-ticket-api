FROM node:24-alpine
WORKDIR /src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 8000
ENV NODE_ENV=production
CMD ["npm", "start"]
# FROM node:24-alpine      # Base image
# WORKDIR /src/app         # Working directory
# COPY package*.json ./    # Copy package files
# RUN npm install          # Install dependencies
# COPY . .                 # Copy application code
# RUN npm run build        # Build the app
# EXPOSE 8000              # Application listens on port 8000
# ENV NODE_ENV=production  # Environment variable
# CMD ["npm", "start"]     # Start the application