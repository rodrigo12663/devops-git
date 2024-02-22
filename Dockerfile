FROM node:16.20.2

WORKDIR /app

COPY ./node-devops .

CMD ["node","index.js"]