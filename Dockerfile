FROM node:19

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

ADD . /usr/src/app

ENV NODE_TLS_REJECT_UNAUTHORIZED=0

RUN yarn

CMD [ "node", "app" ]
