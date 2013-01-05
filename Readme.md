
# NoChan

NoChan is a node.js multi-server BBS application.
Messages are sent with Socket-IO and saved in MongoDB.
Users can stream files in MongoDB/GridFS directly!


## Requirements
* Node.js >= v0.6.2
* MongoDB and Redis installed and running.

## Installation
* git clone git://github.com/Tug/nochan.git
* cd nochan
* npm install .

## Configuring
The config.json file will overwrite properties definied in config.js. Edit it to set your configuration properties such as database host, port, username, password, etc.


## Running
* node app
or
* node app myconfig.js


## TODO
* Load test
* Script deployment
* improve client side : use backbone and mix client and server views, announce new message, add connecting...

