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

#define LOKAL_PORT 55556
#define BAK_LOGG 10 // Størrelse på for kø ventende forespørsler 

int main ()
{
  if(fork()!=0){
    exit(0);
  }

  setsid();
  signal(SIGHUP, SIG_IGN);
  
  if(fork()!=0){
    exit(0);
  }
  
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
  close(3);


  struct sigaction sigchld_action = {
    .sa_handler = SIG_DFL,
    .sa_flags = SA_NOCLDWAIT
  };

  struct sockaddr_in  lok_adr;
  int sd, ny_sd;

  // Setter opp socket-strukturen
  sd = socket(AF_INET, SOCK_STREAM, IPPROTO_TCP);

  // For at operativsystemet ikke skal holde porten reservert etter tjenerens død
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

    int pid = fork();

    if(pid==0) { 
      close(sd);
      close(0);
      close(1);
      dup2(ny_sd, 0);
      dup2(ny_sd, 1);

      int setuid(uid_t uid);
      int setgid(gid_t gid);

      /* Debugging av fildeskriptorer
      char pid[5];
      sprintf(pid, "ls -l /proc/%d/fd", getpid());
      system(pid);
      */

      //leser til buffer fra socket
      read(0, buf, sizeof(buf)-1);
      //henter ut request-metode
      token = strtok(buf, space);
      char requestmethod[strlen(token)];
      strcpy(requestmethod,token);
      //henter ut filsti
      token = strtok(NULL, " /");
      char filepath[strlen(token)]; 
      strcpy(filepath,token);
      //Legger til absolutt sti
      char fullpath[] = "/var/www/static/";
      strcpy(fullpath, filepath);

     // write(1, filetype, strlen(filetype));
      fd = open(fullpath, O_RDONLY);
      if (strcmp(filepath, "HTTP")==0)
        fd = open("index.asis", O_RDONLY);
      else if (fd == -1){
        printf("HTTP/1.1 404 NOT FOUND\n");
        printf("Content-Type: text/plain\n");
        printf("\n");
        printf("Not Found!\n");
      }
      else {
        char filetoken[strlen(token)];
        strcpy(filetoken,token);
        token = strtok(filetoken, dot);
        token = strtok(NULL, space);
        char filetype[strlen(token)];
        strcpy(filetype,token);
        
        /* Debugging info om filsti.
        write(1, requestmethod, strlen(requestmethod));
        write(1, "\n", 1);
        write(1, filepath, strlen(filepath));
        write(1, "\n", 1);
        write(1, filetype, strlen(filetype));
        */
        printf("HTTP/1.1 200 OK\n");
        if (strcmp(filetype, "png")==0) {
          printf("Content-Type: image/png\n\n");
        }
        else if( strcmp(filetype, "xml")==0) {
          printf("Content-Type: application/xml\n\n");
        }
        else if( strcmp(filetype, "html")==0) {
          printf("Content-Type: text/html\n\n");
        }
        else if( strcmp(filetype, "htm")==0) {
          printf("Content-Type: text/html\n\n");
        }
        else if( strcmp(filetype, "xsl")==0) {
          printf("Content-Type: application/xslt+xml\n\n");
        }
        else if( strcmp(filetype, "css")==0) {
          printf("Content-Type: text/css\n\n");
        }
        else {
          printf("Content-Type: text/plain\n\n");
        }
      }
      
      int size = lseek(fd,0,SEEK_END);
      lseek(fd,0,0);
      sendfile(ny_sd, fd, NULL, size);
    
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
