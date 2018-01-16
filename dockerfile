FROM scratch
ADD busybox.tar.xz /
COPY ./a.out /bin/webtjener
COPY ./index.asis /bin
COPY ./404.html /bin
EXPOSE 80
CMD ["sh"]
