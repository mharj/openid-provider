FROM node:alpine
COPY . /opt/service/
RUN cd /opt/service/ && \
NODE_ENV=development npm install && \
npm run test && \
rm -rf /opt/service/node_modules /opt/service/test  && \
NODE_ENV=production npm install
VOLUME ["/opt/service/jwtcerts"]
WORKDIR /opt/service/
CMD ["npm","start"]
