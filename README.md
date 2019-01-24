# Dynamic Yield Personalization API Reference Application

This application provides a simple reference to using the Dynamic Yield Personalization API for server-side
personalization. Please refer to the product guides or the support site as well to receive a full picture.

You can see a live installation of this application at [https://serverside.dyo.io/](https://serverside.dyo.io/).

It is a very simple Node.js + Express application that generates user and session identifiers and activates
the Personalization API to test the content of the hero banner and recommends products under it. During page
rendering the application leaves HTML attributes on personalized tags, such as `data-dyapi-slot-id="..."`,
which are then used as markers for a simple script that monitors clicks and reports user interactions to the
Personalization API from the client-side.

Run it either with Node.js:

```sh
npm install
APPLICATION_PORT=3000 node src/index.js
```

Or using Docker:

```sh
docker run --rm -it $(docker build -q .)
```
