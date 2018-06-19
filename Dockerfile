FROM node:carbon-alpine
LABEL maintainer "Dynamic Yield <support@dynamicyield.com>"
WORKDIR /usr/src/app
ENV NODE_ENV production
ENV APPLICATION_PORT 80
EXPOSE 80
COPY package*.json ./
RUN npm install
COPY . .
CMD [ "npm", "start" ]
