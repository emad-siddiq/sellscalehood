FROM node:14

WORKDIR /app

RUN npm install -g pkg

COPY package.json .
RUN npm install

COPY . .
RUN npm run build

CMD ["pkg", ".", "--out-path=./bin"]