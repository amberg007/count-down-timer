# count-down-timer

This small App, provides a way to display a timer for external screen display and a control screen to change the timer and description


# to start
- Run 
nodemon server.js

-----------------------

Setting up this project to use docker

1. Dockerfile
# Use the official Node.js image as a base
FROM node:latest

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port on which your app will run
EXPOSE 3000

# Command to run the application
CMD ["node", "app.js"]

2. Add a .dockerignore

3. Build the docker image
docker build -t count-down-timer .

4. run the docker container and specify ports and other configurations
docker run -d -p 3000:3000 count-down-timer

