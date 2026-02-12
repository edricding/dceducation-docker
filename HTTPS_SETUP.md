# HTTPS Setup (Docker + Nginx + Let's Encrypt)

## 1) Prerequisites
- DNS `A` records already point to this server:
  - `dceducation.com.cn`
  - `www.dceducation.com.cn`
  - `backend.dceducation.com.cn`
- Server firewall/security group allows inbound `80` and `443`.

## 2) First-time certificate issuance
Run these commands on the server in project root:

```bash
mkdir -p nginx/certbot/conf nginx/certbot/www

# Stop nginx temporarily so certbot standalone can bind port 80
docker compose stop nginx

docker compose --profile ops run --rm --service-ports certbot certonly \
  --standalone \
  --email your-email@example.com \
  --agree-tos \
  --no-eff-email \
  -d dceducation.com.cn \
  -d www.dceducation.com.cn \
  -d backend.dceducation.com.cn
```

## 3) Start services
```bash
docker compose up -d --build
```

After startup, `http://dceducation.com.cn` and `http://backend.dceducation.com.cn` should redirect to HTTPS.

## 4) Auto-renew (recommended with cron)
Set a daily cron job (example: 03:10 every day):

```bash
10 3 * * * cd /path/to/dceducation-docker && docker compose --profile ops run --rm certbot renew --webroot -w /var/www/certbot --quiet && docker compose exec -T nginx nginx -s reload
```

Notes:
- Replace `/path/to/dceducation-docker` with your real path.
- `dcedu.test`, `backend.test`, and port `8081` remain HTTP in current config.
