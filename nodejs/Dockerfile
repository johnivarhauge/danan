FROM alpine

RUN apk add --update sqlite
RUN apk add --update nodejs nodejs-npm

RUN npm install sqlite3 

COPY database /
COPY webserver.js /
COPY node_modules/ /node_modules/
COPY schema.xsd /
COPY brukerschema.xsd /
COPY error.log /
COPY testAPI.sh /

EXPOSE 3000
CMD ["/bin/sh"]
