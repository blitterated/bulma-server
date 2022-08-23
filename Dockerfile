FROM archlinux:latest

MAINTAINER blitterated blitterated@protonmail.com

RUN pacman --noconfirm -Syu npm

WORKDIR /bulma-server

COPY package.json package.json
COPY sassinate.js sassinate.js

RUN npm install

CMD ["npm", "run", "dev"]
