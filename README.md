# angular-spa

Build packages
-------------------------------
The application has more that one package.json file. If you need to rebuild packages you do not need to open
each folder with script and run "npm install". All that you need is run "prepare-packages.sh" script.
If you want to add more scripts for building you need to open prepare-packages.sh and edit it.
The script has variable TARGET_PATHS where you can define a new one.

Run server application
-------------------------------
You need to tun "nodeserver.sh" script for running the application. It does not accept command line arguments
but has a wizard that allows you to configure start. The wizard asks about environment: development and production.
The development environment is default. Next step is simulating user login. Each request to server will emulate user
that you selected when server has been started. The script defines environment variables and that is applicable for
Windows, GNU/Linux and Mac OS.

Variables:
- TARGET_ENV - Target environment = [ Development, Production ] (default: Development)
- TARGET_USER - Target user = [ 
  563b3f1ce8d64c3f52ad008d => anonymous,
  563b3f77e8d64c3f52ad008e => registered,
  563b4018e8d64c3f52ad008f => admin
] (default: none)
