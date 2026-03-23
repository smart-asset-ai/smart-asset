#!/bin/bash
# Smart Asset AI - サービス監視スクリプト

services=("smart-asset-backend" "smart-asset-frontend" "nginx")

for service in "${services[@]}"; do
    if ! systemctl is-active --quiet "$service"; then
        echo "$(date): $service が停止しています。再起動中..." >> /home/ubuntu/smart-asset/monitor.log
        sudo systemctl restart "$service"
    fi
done
