#!/bin/sh

sudo apt-get update && sudo apt-get install curl build-essential openssl libssl-dev git python
export node_version_to_install='v0.8.9'
curl https://raw.github.com/bevry/community/master/install-node/install-node.sh | sh

