FROM node:alpine AS base
RUN mkdir /workdir
WORKDIR /workdir
COPY package.json .

FROM base as deps
RUN apk --update add git
RUN npm i

FROM deps as test
COPY src src
RUN npm test

FROM deps as build
COPY src src
RUN npm run build

FROM nginx:alpine as dist
COPY --from=build /workdir/dist /usr/share/nginx/html
