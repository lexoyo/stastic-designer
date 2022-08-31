FROM node:16.13.1

# example of use:
# docker build -t silex-image .
# docker run -p 6805:6805 -t --rm --name silex -e ENABLE_FS=true -e GITHUB_CLIENT_ID=false -e FS_ROOT=/ silex-image

# see doc about how to use this docker image here:
# https://github.com/silexlabs/Silex/wiki/How-to-Host-An-Instance-of-Silex#docker

# see doc about env vars here:
# https://github.com/silexlabs/Silex/wiki/How-to-Host-An-Instance-of-Silex#environment-variables

# env vars can be overriden using the `-e` option in docker run, some env vars are:
# ENV ENABLE_FS, ENV ENABLE_FTP, ENABLE_SFTP, ENABLE_WEBDAV

COPY . /silex
WORKDIR /silex
#RUN apt-get update

# Not needed apparently
# Install yarn
# RUN npm install -g yarn

# Build with yarn
# This is a workaround because npm install takes a long time
# This doesn't work because silex-website-builder has a postinstall script containing an npm command
# RUN yarn install --ignore-engines

# Install dependencies
# Running install with --unsafe-perm option becaus when running as root, npm won't run any scripts.
RUN npm install --unsafe-perm

# Build stastic
RUN npm run build

EXPOSE 6805
CMD ["npm", "start"]
