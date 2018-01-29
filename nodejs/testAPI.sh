
echo get
curl --request GET http://localhost:3000/data
read -n 1 -s -r -p "Press any key to continue" 

echo post
curl --request POST --header "Content-type: text/xml" \
--data '{"brukerID": 10, }' http://localhost:3000/data
read -n 1 -s -r -p "Press any key to continue" 

echo delete
curl --request DELETE --header "Content-type: text/xml" \
--data '{"brukerID": 2, }' http://localhost:3000/data
read -n 1 -s -r -p "Press any key to continue" 

echo put
curl --request PUT --header "Content-type: text/xml" \
--data '{}' http://localhost:3000/data
