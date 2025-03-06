FROM node:23-alpine

WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm install

COPY . .

RUN npm run build

RUN chmod +x run.sh

EXPOSE 3000

CMD ["sh", "run.sh"]