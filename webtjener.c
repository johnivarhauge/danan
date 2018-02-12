#include <arpa/inet.h>
#include <unistd.h> 
#include <stdlib.h>
#include <stdio.h>
#include <fcntl.h>
#include <string.h>
#include <signal.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <sys/sendfile.h>
#include <dirent.h>


#define LOKAL_PORT 80
#define BAK_LOGG 10 // Størrelse på for kø ventende forespørsler 

int main ()
{
  //Hvis fork ikke returnerer 0, er vi i foreldre-prosess, og vil avslutte programmet
  //Barneprosess kjører videre
  if(fork()!=0){
    exit(0);
  }

  //Oppretter en sesjon og gjør prosessen til sesjonsleder og prosessgruppeleder, frigjøres fra kontroll-terminal
  setsid();
  //Gjør at barneprosesser ignorerer terminering av sesjonsleder
  signal(SIGHUP, SIG_IGN);
  
  //Starter ny barneprosess, foreldreprosess avsluttes
  if(fork()!=0){
    exit(0);
  }
  
  //Skriver til error.log fra STDERR
  char *logFile="./error.log";
  int fp;
  //Åpner error-log fil i deskriptor 3
  if((fp=open(logFile,O_CREAT|O_APPEND|O_WRONLY,0644))!=-1)
  {
    //Kopierer til deskriptor 2 (stderr)
    dup2(fp,2);
  }
  else
  {
    perror(logFile);
  }
  //Lukker deskriptor 3
  close(3);

  //Brukes senere for å forhindre zombier
  struct sigaction sigchld_action = {
    .sa_handler = SIG_DFL,
    .sa_flags = SA_NOCLDWAIT
  };

  //Lager en ny sockaddr_in-struct som kalles lok_adr
  struct sockaddr_in  lok_adr;

  int sd, ny_sd;

  // Setter opp socket-strukturen, med type AF_INET (Internettadresse), SOCK_STREAM (Sendes i byte, 2-veis sekvensiell kommunikasjon), og IPPROTO_TCP (TCP Protokoll)
  sd = socket(AF_INET, SOCK_STREAM, IPPROTO_TCP);

  // For at operativsystemet ikke skal holde porten reservert etter tjenerens død
  setsockopt(sd, SOL_SOCKET, SO_REUSEADDR, &(int){ 1 }, sizeof(int));

  // Initierer lokal adresse
  lok_adr.sin_family      = AF_INET; //Kan kun bruke IPv4
  lok_adr.sin_port        = htons((u_short)LOKAL_PORT); //Settes til Port 80 (htons setter riktig nettverksbit (MSB/LSB))
  lok_adr.sin_addr.s_addr = htonl(         INADDR_ANY); //Aksepterer alle adresser

  // Kobler sammen socket og lokal adresse, og Port 80
  if ( 0==bind(sd, (struct sockaddr *)&lok_adr, sizeof(lok_adr)) )
    printf("Prosess %d er knyttet til port %d.\n", getpid(), LOKAL_PORT);
  else
    exit(1);

  //Gir beskjed om å lytte på sd-socketen
  listen(sd, BAK_LOGG);

  int ret, fd;
  char buf[2000];
  char tempbuf[2000];

  const char dot[2] = ".";
  const char space[2] = " ";
  char *token;

  while(1){ 

    //Venter på, og aksepterer mottatt forespørsel, setter denne til ny fildeskriptor
    ny_sd = accept(sd, NULL, NULL);    

    int pid = fork();

    if(pid==0) { //Hvis barneprosess:
      close(sd); //Lukk sd
      close(0);  //Lukk STDIN
      close(1);  //Lukk STDOUT
      dup2(ny_sd, 0);  //Kopierer ny_sd til STDIN
      dup2(ny_sd, 1);  //Kopierer ny_sd til STDOUT

      //Setter UID og GID slik at prosessen kan kjøre uavhengig av foreldre, gir fra seg rot-privilegie
      int setuid(uid_t uid);
      int setgid(gid_t gid);
      int validType = 0; //Brukes for å sjekke om filtype støttes

      read(0, buf, sizeof(buf)-1); //leser til buffer fra socket
      strcpy(tempbuf, buf);  //Kopierer innholdet i buf til tempbuf
      
      token = strtok(buf, space); //henter ut request-metode (GET / POST) som settes til "token"
      char requestmethod[strlen(token)]; //Lager en ny string med lendge = token
      strcpy(requestmethod,token); //Kopierer token (Request Metode) til "requestmethod"
      setenv("REQUEST_METHOD", requestmethod, 1); //Setter Request Metoden i en variabel, og eksporterer til miljøet
      
      //eksporterer cookie til miljøet hvis den finnes
      if (strstr(tempbuf, "Cookie:")!=NULL) //strstr leter etter første forekomst av "Cookie:" 
        setenv("COOKIE", strstr(tempbuf, "Cookie:"),1); //Kopierer fra og med "Cookie:", og setter det til COOKIE miljøvariabel, og eksporterer

      //henter ut filsti
      token = strtok(NULL, " /"); //Henter ut alt etter request metode fra "buf" frem til " /" (altså filsti), og setter det til "token"
      char filepath[strlen(token)]; //Lager ny variabel for filsti
      strcpy(filepath,token); //Kopierer filsti til variabelen

      //Lager grunnlag for absolutt sti
      char root_dir[17];
      strcpy(root_dir,"var/www/static/"); //Setter root_dir til static
      char cgipath[255];
      
      //Hvis GET med parameter eller POST, skal sidene fra "dynamic" hentes ut (CGI skript)
      if (strchr(filepath,'?')!=NULL || strcmp(requestmethod, "POST")==0){
        strcpy(root_dir,"var/www/dynamic/"); //Endrer rotsti til dynamic

        if (strcmp(requestmethod, "GET")==0) { //Hvis metoden er GET:
          char temp[strlen(filepath)]; //Lager ny variabel med størrelse til filepath
          strcpy(temp, filepath); //Kopierer filsti til temp
          token = strtok(temp,"?"); //Setter alt frem til "?" til token-variabelen
          strcpy(cgipath, token); //Kopierer "token" til "cgipath", inneholder nå navn på filen
          token = strtok(NULL, " "); //Henter ut parametre fra URL, og setter det i "token"
          setenv("QUERY_STRING", token, 1); //Setter parametre til QUERY_STRING, og eksporterer til miljøet
        }
        
        else { //Hvis metoden er POST
          char temp[strlen(filepath)]; //Lager ny variabel med størrelse til filepath
          strcpy(temp, filepath);  //Kopierer filsti til temp
          token = strtok(temp," "); //Alt frem til første space blir satt til token (filnavn)
          strcpy(cgipath, token); //Kopierer filnavnet til cgipath
          
          if (strstr(tempbuf, "brukernavn") != NULL) //Hvis "brukernavn" finnes i tempbuf(som inneholder hele requesten)
            setenv("QUERY_STRING", strstr(tempbuf, "brukernavn"), 1); //Setter alt fra og med "brukernavn" til miljøvariabel, og eksporterer
          
          else if (strstr(tempbuf, "<") != NULL) //Hvis brukernavn ikke finnes, leter den etter kommando
            setenv("QUERY_STRING", strstr(tempbuf, "<"), 1); //Setter alt fra og med "<" til miljøvariabel, og eksporterer
        }
      }

      char fullpath[18 + strlen(filepath)]; //Lager variabel 
      strcpy(fullpath, root_dir); //Kopierer rotstien til fullpath
      

      //Bygger filsti for alle filer som ikke er get med parameter eller post
      if (strchr(filepath,'?')==NULL && strcmp(requestmethod, "POST")!=0) //Hvis det ikke er GET med parametre, eller POST
        strcat(fullpath, filepath); //Kopierer filnavn til fullpath
      else 
        strcat(fullpath, cgipath); //Kopierer filnavn på CGI fil til fullpath

      //Gjelder for post og get med parameter
      if (strchr(filepath,'?')!=NULL && (open(fullpath, O_RDONLY) != -1) || strcmp(requestmethod, "POST")==0){
        system(fullpath);
      }

      //For alle andre filtyper
      else {
        fd = open(fullpath, O_RDONLY);

        if (strcmp(filepath, "HTTP")==0){ //Hvis ingen fil er angitt
          printf("HTTP/1.1 200 OK\n");
          printf("Content-Type: text/html\n\n");
          fd = open("var/www/static/index.html", O_RDONLY);
        }  
        else if (fd == -1){ //Hvis angitt fil ikke eksisterer
          printf("HTTP/1.1 404 NOT FOUND\n");
          printf("Content-Type: text/html\n\n");
          fd = open("var/www/static/404.html", O_RDONLY);
        }
        else { //For alle andre tilfeller, henter ut filtype, og leverer riktig mime-type
          char filetoken[strlen(token)];
          strcpy(filetoken,token);
          token = strtok(filetoken, dot);
          token = strtok(NULL, space);
          char filetype[strlen(token)];
          strcpy(filetype,token);

          if (strcmp(filetype, "asis")!=0){
        
            if (strcmp(filetype, "png")==0) {
              printf("HTTP/1.1 200 OK\n");
              printf("Content-Type: image/png\n\n");
            }
            else if( strcmp(filetype, "xml")==0) {
              printf("HTTP/1.1 200 OK\n");
              printf("Content-Type: application/xml\n\n");
            }
            else if( strcmp(filetype, "html")==0) {
              printf("HTTP/1.1 200 OK\n");
              printf("Content-Type: text/html\n\n");
            }
            else if( strcmp(filetype, "htm")==0) {
              printf("HTTP/1.1 200 OK\n");
              printf("Content-Type: text/html\n\n");
            }
            else if( strcmp(filetype, "xsl")==0) {
              printf("HTTP/1.1 200 OK\n");
              printf("Content-Type: application/xslt+xml\n\n");
            }
            else if( strcmp(filetype, "css")==0) {
              printf("HTTP/1.1 200 OK\n");
              printf("Content-Type: text/css\n\n");
            }
            else if( strcmp(filetype, "gif")==0) {
              printf("HTTP/1.1 200 OK\n");
              printf("Content-Type: image/gif\n\n");
            }
            else {
              /*printf("HTTP/1.1 404 NOT FOUND\n");
              printf("Content-Type: text/html\n\n");
              printf("The File type of the request is unsupported\n");*/
              printf("HTTP/1.1 415 Unsupported Media Type\n");
              printf("Content-Type: text/plain; charset=utf-8\n\n");
              printf("The File type of the request is unsupported\n"); 
              validType = 1;
            }
          }
        }
      
        if(validType == 0){
          int size = lseek(fd,0,SEEK_END); //Finner størrelse til filen som skal leveres
          lseek(fd,0,0); //Setter pekeren tilbake til starten av filen
          sendfile(ny_sd, fd, NULL, size); //Sender filen direkte til socketen
        }
      }
      // Sørger for å stenge socket for skriving og lesing
      // NB! Frigjør ingen plass i fildeskriptortabellen
      shutdown(ny_sd, SHUT_RDWR); 
      exit(0);
    }

    else {
      close(ny_sd);
      sigaction(SIGCHLD, &sigchld_action, NULL);
    }
  }
  return 0;
}
