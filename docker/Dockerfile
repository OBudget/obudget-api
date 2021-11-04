FROM node:13

WORKDIR /usr/src/app
COPY package*.json ./
COPY . .

EXPOSE 8080
RUN npm ci --only=production
CMD [ "npm", "run", "prod" ]
