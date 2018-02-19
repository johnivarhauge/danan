#Using Minimal Docker Image
FROM alpine

RUN apk add --update sqlite
COPY var/ /var/
COPY a.out /webtjener
COPY info.db /
COPY entrypoint.sh /
EXPOSE 80

ENTRYPOINT ["/entrypoint.sh"]
