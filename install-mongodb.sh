#!/bin/sh

# Add Third-Party Repositories
sources=$(find /etc/apt/sources.list.d | xargs grep 'deb http://downloads-distro.mongodb.org/repo/ubuntu-upstart dist 10gen' | cut -d ":" -f1 | uniq)

if [ -z $sources ]
  then
    echo "Adding 10gen repository."
    sudo sh -c "echo 'deb http://downloads-distro.mongodb.org/repo/ubuntu-upstart dist 10gen' >> /etc/apt/sources.list.d/downloads-distro.mongodb.org.list"
    sudo apt-key adv --keyserver keyserver.ubuntu.com --recv 7F0CEB10
fi

# Update apt-get
echo "Updating package list."
sudo apt-get update 2>/dev/null 1>/dev/null

# Install mongoDB
dpkg -L mongodb-10gen 2>/dev/null 1>/dev/null
if [ $? -eq 1 ]
  then
    echo "Installing mongodb-10gen"
    sudo apt-get -y install mongodb-10gen
fi
