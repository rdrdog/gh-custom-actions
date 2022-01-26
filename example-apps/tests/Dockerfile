# Our container is based on node 14, using an alpine linux container.
FROM node:14-alpine3.11

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
# This is a typescript application, so we want to run our compile step at build time
RUN npm run compile

# Run our tests when the built image is run.
# We use the 'test:env' npm task which loads a cucumber profile based on the value of the
# ENVIRONMENT_NAME environment variable, passed in at deploy time by the pipeline.
ENTRYPOINT ["npm", "run", "test:env"]
