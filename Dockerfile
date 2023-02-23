FROM node:17-alpine
WORKDIR /scheduling-app
COPY . .
RUN npm install 

ENV NODE_ENV=production
ARG SERVER_DATABASE_URL
ARG SERVER_PORT
RUN npm run build

EXPOSE ${SERVER_PORT}
CMD ["npm", "run", "prod"]

