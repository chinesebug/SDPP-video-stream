FROM node:10

#FROM m03geek/opencv-dlib-node:alpine
#RUN apk update && apk add -u --no-cache python make g++
#RUN npm i opencv4nodejs

WORKDIR /seller

COPY package.json ./

RUN npm install

COPY . /seller

EXPOSE 3000

CMD [ "node", "index.js" ]
