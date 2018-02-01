#!/bin/sh
OPERATION=$(echo $QUERY_STRING | cut -f1 -d " ")

if [ "$OPERATION" = "<updateList>" ]; then
    RESPONSE=$(curl --request GET localhost:3000/lesealledikt/)
    echo "HTTP/1.1 200 OK"
    echo "Content-type:text/html;charset=utf-8"
    echo
    echo "$RESPONSE"
    
fi
