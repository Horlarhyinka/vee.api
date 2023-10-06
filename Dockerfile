FROM node:18-alpine
WORKDIR /api/app
COPY package.json .
RUN npm install -f
RUN npm install -g -f typescript
#install ssl certificate
RUN apk update && \
apk add openssl && \
mkdir cert && \
cd cert && \
openssl genrsa -out key.pem && \
openssl req -new -key key.pem -out csr.pem -subj "/C=AU/ST=Lagos/L=Lagos/O=cb/OU=cb/CN=cb/emailAddress=horlarhyinkaddev@gmail.com" && \
openssl x509 -req -days 10000 -in csr.pem -signkey key.pem -out cert.pem && \
cd ..
COPY . .
ENV APP_SECRET=95a97313c4bf1a59af7ec34754bcaa4e
ENV CLIENT_URL=https://vee-views.vercel.app
ENV DB_URL=mongodb+srv://Horlarh:1234@cluster0.syhy6.mongodb.net/chatbox
ENV MAIL_ADDRESS=noreply@vee@info.com
ENV MAIL_PASS=4c5a375b0f2808
ENV MAIL_USER=4f6b3a50868d83
ENV NODE_ENV=production
EXPOSE 8000
CMD [ "npm", "run", "Dev" ]