FROM node:10

WORKDIR /buyer

COPY package*.json ./

RUN npm install

COPY . /buyer

EXPOSE 8080

CMD [ "node", "client.js" ]
