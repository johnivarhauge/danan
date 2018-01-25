#Using Minimal Docker Image
FROM alpine

RUN apk add --update sqlite
COPY var/ /var/
COPY a.out /webtjener
COPY info.db /
EXPOSE 80
CMD ["/bin/sh"]
