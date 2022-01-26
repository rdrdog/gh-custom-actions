# Our container is based on node 14, using an alpine linux container.
FROM node:14-alpine3.11 as base

# Set our working folder to /working in the container
WORKDIR /working

# Copy our package.json/package-lock.json into the container
COPY package*.json ./
# Now install our dependencies
RUN npm ci

# Copy the rest of our source across.
# We do this separately from our package.json files to take advantage of docker layer caching.
# As a result, we want to put less frequently changing things higher in the dockerfile.
COPY . .
# Run our unit tests
RUN npm test

# We get these as our build arguments - we can map these to environment variables so that our application can make use of them.
# One use of this is to report a version based on the commit sha and build number.
ARG COMMIT_SHA
ARG BUILD_NUMBER
ENV COMMIT_SHA=$COMMIT_SHA
ENV BUILD_NUMBER=$BUILD_NUMBER

# Run the 'start' npm task when the container is deployed and started up.
ENTRYPOINT npm start
