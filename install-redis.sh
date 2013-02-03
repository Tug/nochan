#!/bin/bash

VERSION="$1"
[[ $VERSION ]] || VERSION="2.4.10"

apt-get install -y build-essential

pushd /usr/src
groupadd redis
useradd -g redis redis
mkdir -p /var/lib/redis
chown redis:redis /var/lib/redis
[[ -f redis-$VERSION.tar.gz ]] || wget http://redis.googlecode.com/files/redis-$VERSION.tar.gz || exit $?
[[ -d redis-$VERSION ]] || tar xzf redis-$VERSION.tar.gz
pushd redis-$VERSION
make -j4 || exit $?
make install || exit $?
popd
popd

mkdir -p /etc/redis

[[ -f /etc/redis/redis.conf ]] || cat >/etc/redis/redis.conf <<EOF
daemonize yes
pidfile /var/run/redis.pid
port 6379
bind 127.0.0.1
timeout 0
loglevel verbose
logfile stdout
databases 16
save 900 1
save 300 10
save 60 10000
rdbcompression yes
dbfilename dump.rdb
dir /var/lib/redis
slave-serve-stale-data yes
# repl-ping-slave-period 10
# repl-timeout 60
# requirepass foobared
# rename-command CONFIG b840fc02d524045429941cc15f59e41cb7be6c52
# maxclients 128
# maxmemory <bytes>
# maxmemory-policy volatile-lru
# maxmemory-samples 3
appendonly no
appendfsync everysec
no-appendfsync-on-rewrite no
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 64mb
slowlog-log-slower-than 10000
slowlog-max-len 1024
vm-enabled no
vm-swap-file /tmp/redis.swap
vm-max-memory 0
vm-page-size 32
vm-pages 134217728
vm-max-threads 4
hash-max-zipmap-entries 512
hash-max-zipmap-value 64
list-max-ziplist-entries 512
list-max-ziplist-value 64
set-max-intset-entries 512
zset-max-ziplist-entries 128
zset-max-ziplist-value 64
activerehashing yes
# include /path/to/local.conf
EOF

[[ -f /etc/init.d/redis-server ]] || cat >/etc/init.d/redis-server <<EOF
#! /bin/sh
### BEGIN INIT INFO
# Provides:		redis-server
# Required-Start:	\$local_fs \$remote_fs \$network \$syslog
# Required-Stop:	\$local_fs \$remote_fs \$network \$syslog
# Default-Start:	2 3 4 5
# Default-Stop:		0 1 6
# Short-Description:	redis-server - persistent key-value db
# Description:		redis-server - persistent key-value db
### END INIT INFO
PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin
DAEMON=/usr/local/bin/redis-server
DAEMON_ARGS=/etc/redis/redis.conf
NAME=redis-server
DESC=redis-server
PIDFILE=/var/run/redis.pid
test -x \$DAEMON || exit 0
set -e
case "\$1" in
  start)
	echo -n "Starting \$DESC: "
	touch \$PIDFILE
	chown redis:redis \$PIDFILE
	if start-stop-daemon --start --quiet --umask 007 --pidfile \$PIDFILE --chuid redis:redis --exec \$DAEMON -- \$DAEMON_ARGS
	then
		echo "\$NAME."
	else
		echo "failed"
	fi
	;;
  stop)
	echo -n "Stopping \$DESC: "
	if start-stop-daemon --stop --retry forever/QUIT/1 --quiet --oknodo --pidfile \$PIDFILE --exec \$DAEMON
	then
		echo "\$NAME."
	else
		echo "failed"
	fi
	rm -f \$PIDFILE
	;;
  restart|force-reload)
	\${0} stop
	\${0} start
	;;
  status)
	echo -n "\$DESC is "
	if start-stop-daemon --stop --quiet --signal 0 --name \${NAME} --pidfile \${PIDFILE}
	then
		echo "running"
	else
		echo "not running"
		exit 1
	fi
	;;
  *)
	echo "Usage: /etc/init.d/\$NAME {start|stop|restart|force-reload}" >&2
	exit 1
	;;
esac
exit 0
EOF

update-rc.d redis-server defaults
/etc/init.d/redis-server restart || exit $?
