FROM node:16.13.2-slim

RUN apt-get -y update
RUN apt-get -y install git

COPY dist/index.js /index.js

RUN ls -la /
ENTRYPOINT ["node", "/index.js"]
