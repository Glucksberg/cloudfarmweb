# 🔒 Configurar SSL/HTTPS no VPS CloudFarm

## Problema: Mixed Content Security
Seu frontend (HTTPS) não pode conectar no backend (HTTP) por questões de segurança do navegador.

## Solução: Configurar HTTPS no VPS

### Opção 1: Nginx + Let's Encrypt (Recomendado)

#### 1. Instalar Nginx
```bash
sudo apt update
sudo apt install nginx
```

#### 2. Configurar Nginx como proxy para sua API
```bash
sudo nano /etc/nginx/sites-available/cloudfarm
```

Conteúdo do arquivo:
```nginx
server {
    listen 80;
    server_name 178.156.157.146;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /ws {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### 3. Ativar o site
```bash
sudo ln -s /etc/nginx/sites-available/cloudfarm /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 4. Instalar Certbot para SSL
```bash
sudo apt install certbot python3-certbot-nginx
```

#### 5. Obter certificado SSL (precisa de domínio)
```bash
# Se você tiver um domínio apontando para o VPS:
sudo certbot --nginx -d seudominio.com

# Isso vai converter automaticamente para HTTPS
```

### Opção 2: Cloudflare Tunnel (Mais Fácil)

#### 1. Instalar cloudflared
```bash
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb
```

#### 2. Criar tunnel
```bash
cloudflared tunnel login
cloudflared tunnel create cloudfarm
cloudflared tunnel route dns cloudfarm seudominio.com
```

#### 3. Configurar tunnel
```bash
nano ~/.cloudflared/config.yml
```

Conteúdo:
```yaml
tunnel: cloudfarm
credentials-file: /home/user/.cloudflared/[tunnel-id].json

ingress:
  - hostname: seudominio.com
    service: http://localhost:3001
  - service: http_status:404
```

#### 4. Executar tunnel
```bash
cloudflared tunnel run cloudfarm
```

### Opção 3: Usar IP com Self-Signed Certificate

#### 1. Gerar certificado auto-assinado
```bash
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/private/cloudfarm.key \
  -out /etc/ssl/certs/cloudfarm.crt \
  -subj "/C=BR/ST=State/L=City/O=CloudFarm/CN=178.156.157.146"
```

#### 2. Configurar Nginx com SSL
```nginx
server {
    listen 443 ssl;
    server_name 178.156.157.146;

    ssl_certificate /etc/ssl/certs/cloudfarm.crt;
    ssl_certificate_key /etc/ssl/private/cloudfarm.key;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /ws {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Após Configurar SSL

Atualize o .env do frontend:
```bash
REACT_APP_CLOUDFARM_API_URL=https://178.156.157.146/api
REACT_APP_CLOUDFARM_WS_URL=wss://178.156.157.146/ws
```

Ou se usar domínio:
```bash
REACT_APP_CLOUDFARM_API_URL=https://seudominio.com/api
REACT_APP_CLOUDFARM_WS_URL=wss://seudominio.com/ws
```

## Verificar se Funcionou
```bash
# Testar HTTPS
curl -k https://178.156.157.146/api/health

# Ver se certificado está correto
openssl s_client -connect 178.156.157.146:443
```
