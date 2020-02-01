# Server

I run a server at home. This is what I run on it.

# Usage

1. Copy the [`example.env`](./example.env) file as `.env` and fill out the values.

1. `docker-compose up -d`

## As a service

In systemd contexts, put this code in something like `/etc/systemd/system/personal-server.service`

```ini
# /etc/systemd/system/personal-server.service

[Unit]
Description=Personal Server
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory={PATH_TO_YOUR_THIS_REPO}
ExecStart=/usr/bin/docker-compose up -d
ExecStop=/usr/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
```

After that file is created, it can be run by `systemctl start personal-server`.

Make it run on boot by `systemctl enable personal-server`

# Included programs

## Deluge

[Torrent daemon, with OpenVPN and Privoxy.](https://store.docker.com/community/images/binhex/arch-delugevpn)

## [Plex](https://www.plex.tv/)

Media server/player

## [Portainer](portainer.io)

Container Management UI

[UI: localhost:9000](localhost:9000)

## Sonarr

Smart PVR for newsgroup and bittorrent users.
