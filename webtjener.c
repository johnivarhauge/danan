#include <arpa/inet.h>
#include <unistd.h> 
#include <stdlib.h>
#include <stdio.h>
#include <fcntl.h>
#include <string.h>

#include <sys/types.h>
#include <sys/stat.h>
#include <sys/sendfile.h>

#define LOKAL_PORT 55556
#define BAK_LOGG 10 // Størrelse på for kø ventende forespørsler 

int main ()
{
  //Skriver til error.log fra STDERR
  char *logFile="./error.log";
  int fp;
  if((fp=open(logFile,O_CREAT|O_APPEND|O_WRONLY,0644))!=-1)
  {
    dup2(fp,2);
  }
  else
  {
    perror(logFile);
  }

  struct sockaddr_in  lok_adr;
  int sd, ny_sd;

  // Setter opp socket-strukturen
  sd = socket(AF_INET, SOCK_STREAM, IPPROTO_TCP);

  // For at operativsystemet ikke skal holdte porten reservert etter tjenerens død
  setsockopt(sd, SOL_SOCKET, SO_REUSEADDR, &(int){ 1 }, sizeof(int));

  // Initierer lokal adresse
  lok_adr.sin_family      = AF_INET;
  lok_adr.sin_port        = htons((u_short)LOKAL_PORT); 
  lok_adr.sin_addr.s_addr = htonl(         INADDR_ANY);

  // Kobler sammen socket og lokal adresse
  if ( 0==bind(sd, (struct sockaddr *)&lok_adr, sizeof(lok_adr)) )
    printf("Prosess %d er knyttet til port %d.\n", getpid(), LOKAL_PORT);
  else
    exit(1);

  // Venter på forespørsel om forbindelse
  listen(sd, BAK_LOGG); 

  int ret, fd;
  char buf[50];
  char requestbuffer[30];

  const char dot[2] = ".";
  const char space[2] = " ";
  char *token;

  //Test for å skrive to STDERR
  //fprintf( stderr, "my %s has %d chars\n", "string format", 30);

  while(1){ 

    // Aksepterer mottatt forespørsel
    ny_sd = accept(sd, NULL, NULL);    

    if(0==fork()) { 
      //leser til buffer fra socket
      read(ny_sd, buf, sizeof(buf)-1);
      //henter ut request-metode
      token = strtok(buf, space);
      char requestmethod[strlen(token)];
      strcpy(requestmethod,token);
      //henter ut filsti
      token = strtok(NULL, " /");
      char filepath[strlen(token)]; 
      strcpy(filepath,token);
      //henter ut filtype

      /*if (filepath!=NULL) {
        char filetoken[strlen(token)]; 
        strcpy(filetoken,token);
        token = strtok(filetoken, dot);
        token = strtok(NULL, space);
        char filetype[strlen(token)];
        strcpy(filetype,token);
      }*/

      //skriver ut de ulike delene av stien på standard ut
      write(1, requestmethod, strlen(requestmethod));
      write(1, "\n", 2);
      write(1, filepath, strlen(filepath));

     // write(1, filetype, strlen(filetype));
      fd = open(filepath, O_RDONLY);
      if (strcmp(filepath, "HTTP")==0)
        fd = open("index.asis", O_RDONLY);
      else if (fd == -1){
         fd = open("404.html", O_RDONLY);
      }
        int size = lseek(fd,0,SEEK_END);
        lseek(fd,0,0);
        sendfile(ny_sd, fd, NULL, size);
    
      // Sørger for å stenge socket for skriving og lesing
      // NB! Frigjør ingen plass i fildeskriptortabellen
      shutdown(ny_sd, SHUT_RDWR); 
    }
    else {
      close(ny_sd);
    }
  }
  return 0;
}
