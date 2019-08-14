#!/bin/sh

echo "Installing..."
cat <<EOF > /etc/systemd/system/hexa-backup-ui.service
[Unit]
Description=Hexa Backup Ui
After=network-online.target

[Service]
Type=simple
User=arnaud
Group=arnaud
UMask=007
WorkingDirectory=/home/arnaud/repos/persos/hexa-backup-ui
ExecStart=/home/arnaud/.nvm/versions/node/v10.16.0/bin/node /home/arnaud/.yarn/bin/http-server /home/arnaud/repos/persos/hexa-backup-ui -p 4200
Restart=always
TimeoutStopSec=300

[Install]
WantedBy=multi-user.target
Alias=hexa-backup-ui.service
EOF

echo "Reload units..."
systemctl daemon-reload

echo "Restarting..."
systemctl restart hexa-backup-ui.service

echo "Status"
systemctl status hexa-backup-ui.service

echo "Done !"