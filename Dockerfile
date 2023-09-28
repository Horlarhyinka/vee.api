FROM node:18-alpine
WORKDIR /api/app
COPY package.json .
RUN npm install -f
RUN npm install -g -f typescript
COPY . .
RUN tsc
EXPOSE 8000
CMD [ "npm", "run", "Dev" ]