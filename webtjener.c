#include <arpa/inet.h>
#include <unistd.h> 
#include <stdlib.h>
#include <stdio.h>
#include <fcntl.h>
#include <string.h>

#define LOKAL_PORT 55556
#define BAK_LOGG 10 // Størrelse på for kø ventende forespørsler 

int main ()
{

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

  const char spaceslash[3] = " /";
  const char space[2] = " ";
  char *token;

  while(1){ 

    // Aksepterer mottatt forespørsel
    ny_sd = accept(sd, NULL, NULL);    

    if(0==fork()) {
      read(ny_sd, buf, sizeof(buf)-1);
      token = strtok(buf, space);
      char requestmethod[strlen(token)];
      strcpy(requestmethod,token);
      token = strtok(NULL, space);
      char filepath[strlen(token)]; 
      strcpy(filepath,token);

      write(1, requestmethod, strlen(requestmethod));
      write(1, filepath, strlen(filepath));
  
      dup2(ny_sd, 1); // redirigerer socket til standard utgang

      printf("HTTP/1.1 200 OK\n");
      printf("Content-Type: text/plain\n");
      printf("\n");
      printf("Hallo klient!\n");

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
