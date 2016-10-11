# Keyboard Hero
Keyboard Hero is a web based music game.
## Development
For development you will need grunt and karma
```` shell
npm install -g grunt-cli karma-cli
````
Change into project directory, then type:
```` shell
npm install
````
Put .mp3 files into the "level" folder then run:
```` shell
grunt default
````
Grunt starts a webserver, watches files for change and uses browserify to generate the javascript. The root dir of the generated code is "build"

You can start the game via http://localhost:9080/index.html

The levelgenerator script needs chrome, it launches a window with --remote-debugging-port=9222 to get the return values.
