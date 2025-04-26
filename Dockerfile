# 1. Base Image: Start from an official Node.js image.
FROM node:22-alpine

# 2. Working Directory: Set the directory where commands will run inside the container.
WORKDIR /usr/src/app

# 3. Copy package files: Copy package.json and package-lock.json first.
COPY package*.json ./

# 4. Install Dependencies: Run npm install inside the container.
RUN npm install
# Note: For production, might use 'npm ci --only=production', but for dev, we install everything.

# 5. Copy Application Code: Copy the rest of your application code into the container's working directory.
COPY . .

# 6. Expose Port: Inform Docker that the container will listen on port 3000 at runtime.
EXPOSE 3000

# 7. Default Command: Specify the command to run when the container starts.
CMD [ "node", "src/server.js" ]