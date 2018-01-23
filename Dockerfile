#Using Minimal Docker Image
FROM busybox

#Each COPY command will add a new Image Layer
COPY var/ /var/
COPY a.out /bin/webtjener
EXPOSE 80
CMD ["/bin/sh"]
