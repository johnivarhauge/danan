function loadWindow(){
  checkCookie;
  poem('list', '<updateList>', 'all');
}

function poem(id, kommando, title) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "dikt.cgi", false);
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4)
      {
        //alert(xhr.responseText);
        if (id==='innhold') {
          document.getElementById(id).value = this.responseText;
        }
        else
        document.getElementById(id).innerHTML = this.responseText;
        
      }
    };
    xhr.send(kommando + "," + title);
}
function getSelectedText(elementId) {
  var elt = document.getElementById(elementId);

  if (elt.selectedIndex == -1)
    return null;

  return elt.options[elt.selectedIndex].value;
}

//NY AJAX FUNKSJON
function editPoem(content, title) {
  if(document.getElementById('innhold').value == "") {
    alert('Tomt dikt!');
    return null;
  }

  var xhr = new XMLHttpRequest();
  var url = "http://localhost:3000/endredikt/" + title;
  alert(url);
  xhr.open("PUT", url, false);
  xhr.setRequestHeader("Content-Type", "text/xml");
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4)
    {
      alert(content + xhr.status);
      //document.getElementById('innhold').innerHTML = this.responseText;      
    }
  };
  
  xhr.send("<dikt>"+content+"</dikt>");
} 

//NY AJAX FUNKSJON (MÅ ENDRE UPDATELIST FUNKSJON)
function saveNewPoem(content, title) {
  if(document.getElementById('innhold').value == "") {
    alert('Tomt dikt!');
    return null;
  }
  
  var xhr = new XMLHttpRequest();
  var dikt = document.getElementById('innhold').value;
  //alert(title + dikt);
  xhr.open("POST", "http://localhost:3000/nyttdikt/", true);
  xhr.setRequestHeader("Content-type", "text/xml");
  xhr.onreadystatechange = function() {
      if (xhr.readyState === 4)
      {
        alert("Nytt dikt opprettet");
        //document.getElementById('innhold').innerHTML = this.responseText;
        poem('list', '<updateList>', 'all');
        
      }
    };
  xhr.send("<diktID>"+title+"</diktID><dikt>"+content+"</dikt>");
                
} 

//NY AJAX FUNKSJON (MÅ LEGGE TIL UPDATELIST)
function deleteAllPoems() {
  
  var xhr = new XMLHttpRequest();
  var url = "http://localhost:3000/slettealledikt/";
  xhr.open("DELETE", url, true);
  xhr.setRequestHeader("Content-Type", "text/xml");
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4)
    {
      //Må ha med "updateList når den er laget!!!"     
    }
  };
  
  xhr.send("");
} 

//sjekke cookie
function checkCookie() {
  //xhr.responseText=undefined;
  var xhr = new XMLHttpRequest();
  xhr.open("POST", "dikt.cgi", false);
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4)
    {
        if (this.responseText == "NOTLOGGEDIN") 
        {
          alert("you have to log in to make changes");
          window.location.replace("info.html");
        }
    }
  };
  xhr.send('<cookieCheck>');                
} 
//Logge ut
function logOut() {
  var xhr = new XMLHttpRequest();
  xhr.open("POST", "dikt.cgi", false);
  xhr.send('<logOut>'+',');
  window.location.replace("info.html");                        
}


window.onload = loadWindow;
window.onbeforeunload = logOut;
