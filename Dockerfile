FROM node:16-alpine

RUN apk update && apk add --no-cache git openssh

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

ADD . /usr/src/app

ENV NODE_TLS_REJECT_UNAUTHORIZED=0

RUN yarn

CMD [ "node app" ]
