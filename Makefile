
rebase-build-deploy:
	git pull --rebase
	yarn build
	sudo systemctl restart hexa-backup-ui

build-deploy:
	yarn build
	sudo systemctl restart hexa-backup-ui