#!/bin/bash
POEMCOMMAND=$(echo $QUERY_STRING | cut -f1 -d ",")
TITLE=$(echo $QUERY_STRING | cut -f2 -d ",")
POEM=$(echo $QUERY_STRING | cut -f3 -d ",")
COOKIE=$(echo $COOKIE | cut -f2 -d '=' | cut -f1 -d" " | tr -d '\n\r')
COOKIESTATUS=$(curl --request GET localhost:3000/sesjonssjekk/$COOKIE | grep -oP '(?<=Antall>)[^<]+' )

if [ $COOKIESTATUS -eq 1 ]; then
    if [ "$POEMCOMMAND" = "<updateList>" ]; then
        ANTALLDIKT=$(curl -s --request GET localhost:3000/antalldikt/ | grep -oP '(?<=Antall>)[^<]+')
        RESPONSE=$(curl -s --request GET localhost:3000/lesealledikt/ | grep -oP '(?<=diktID>)[^<]+')
        BODY=""
        
        for ((i=1;i<="${ANTALLDIKT}"; i++));
        do
            CURRENTPOEM=$(echo "${RESPONSE}" | cut -f$i -d$'\n')
            BODY+=$(echo '<option value="'$CURRENTPOEM'">'$CURRENTPOEM'</option>')
        done
        CONTENTLENGTH=$(echo ${#BODY})

        echo "HTTP/1.1 200 OK"
        echo "Content-type: text/html; charset=utf-8"
        echo "Content-Length: $CONTENTLENGTH"
        echo
        #echo "${RESPONSE}"
        echo "$BODY"
    fi

    if [ "$POEMCOMMAND" = "<savePoem>" ]; then
        RESPONSE=$(curl -X POST -H "Content-Type: text/xml" -d "<diktID>$TITLE</diktID><dikt>$POEM</dikt>" localhost:3000/nyttdikt/)
        echo "HTTP/1.1 200 OK"
        echo "Content-type:text/html;charset=utf-8"
        echo
        echo $RESPONSE
    fi

    if [ "$POEMCOMMAND" = "<getPoem>" ]; then
        URLTITLE=$(echo $TITLE | sed 's/ /%20/g')
        RESPONSE=$(curl --request GET localhost:3000/lesedikt/$URLTITLE | grep -oP '(?<=dikt>)[^<]+')
        echo "HTTP/1.1 200 OK"
        echo "Content-type:text/html;charset=utf-8"
        echo
        echo "$RESPONSE"
    fi

    if [ "$POEMCOMMAND" = "<editPoem>" ]; then
        URLTITLE=$(echo $TITLE | sed 's/ /%20/g')
        RESPONSE=$(curl -X PUT -H "Content-Type: text/xml" -d "<dikt>$POEM</dikt>" localhost:3000/endredikt/$URLTITLE)
        echo "HTTP/1.1 200 OK"
        echo "Content-type:text/html;charset=utf-8"
        echo
        echo $RESPONSE
    fi

    if [ "$POEMCOMMAND" = "<deletePoem>" ]; then
        URLTITLE=$(echo $TITLE | sed 's/ /%20/g')
        RESPONSE=$(curl -X DELETE localhost:3000/slettedikt/$URLTITLE)
        echo "HTTP/1.1 200 OK"
        echo "Content-type:text/html;charset=utf-8"
        echo
        echo $RESPONSE
    fi

    if [ "$POEMCOMMAND" = "<deletePoems>" ]; then
        RESPONSE=$(curl -X DELETE localhost:3000/slettealledikt/)
        echo "HTTP/1.1 200 OK"
        echo "Content-type:text/html;charset=utf-8"
        echo
        echo $RESPONSE
    fi

    if [ "$POEMCOMMAND" = "<logOut>" ]; then
        RESPONSE=$(curl -X DELETE localhost:3000/slettsesjon/$COOKIE)
        echo "HTTP/1.1 200 OK"
        echo "Content-type:text/html;charset=utf-8"
        echo
        echo $RESPONSE
    fi
else
    echo "HTTP/1.1 200 OK"
    echo "Content-type:text/html;charset=utf-8"
    echo
    echo -n "NOTLOGGEDIN"
fi