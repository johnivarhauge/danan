#!/bin/sh

if [ "$QUERY_STRING" = "<updateList>" ]; then
    RESPONSE=$(curl --request GET localhost:3000/lesealledikt/ | grep -oP '(?<=diktID>)[^<]+')
    #DIKTID=($(echo $RESPONSE | grep -oP '(?<=diktID>)[^<]+'))
    echo "HTTP/1.1 200 OK"
    echo "Content-type:text/html;charset=utf-8"
    echo
    #echo $RESPONSE
    for i in $RESPONSE
    do
       echo "<option>""$i""</option>"
    done
fi
