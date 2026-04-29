# README: Kamatera Deployment Guide for Personal Portfolio

This document provides comprehensive instructions for deploying the Personal Portfolio website to Kamatera cloud infrastructure.

## 🚀 Quick Start

### Prerequisites
1. **Kamatera Account** - Sign up at [Kamatera.com](https://www.kamatera.com/)
2. **Cloud Server** - Minimum: 1 vCPU, 1GB RAM (Ubuntu 20.04/22.04 recommended)
3. **Domain Name** - Optional but recommended (for SSL and professional appearance)
4. **SSH Key** - For secure server access

### Option 1: Automated Deployment (Recommended)

#### Step 1: Configure Deployment Settings

Edit `deploy.sh` to set your server details:

```bash
SERVER_USER="root"              # SSH user (usually root)
SERVER_HOST="1.2.3.4"           # Your Kamatera server IP
SERVER_PORT="22"                # SSH port
APP_DIR="/opt/portfolio"        # Installation directory
DOMAIN="portfolio.yourdomain.com"  # Your domain (for SSL)
```

#### Step 2: Deploy to Kamatera

```bash
# Deploy to remote server
./deploy.sh --remote --host YOUR_SERVER_IP --user root
```

The script will:
- Connect to your server via SSH
- Install Docker (if not present)
- Build the Docker image
- Deploy the container
- Configure automatic restarts

#### Step 3: Verify Deployment

```bash
# Access your site
curl http://YOUR_SERVER_IP

# Or open in browser
http://YOUR_SERVER_IP
```

### Option 2: Docker Compose Deployment

#### Step 1: Transfer Files to Server

```bash
scp -r . root@YOUR_SERVER_IP:/opt/portfolio
```

#### Step 2: Deploy with Docker Compose

```bash
ssh root@YOUR_SERVER_IP
cd /opt/portfolio
docker-compose up -d
```

#### Step 3: Verify

```bash
docker ps
docker logs portfolio-app
curl localhost
```

## 📦 Docker Configuration

### Dockerfile Overview

The project uses a multi-stage build:

1. **Builder Stage**: Prepares dependencies
2. **Nginx Stage**: Serves static files efficiently

### Key Features

- **Nginx** - High-performance static file server
- **Automatic HTTPS** - Ready for Let's Encrypt SSL
- **Health Checks** - Container monitoring included
- **Optimized Caching** - Cache headers for performance
- **Security Headers** - Built-in security protections

### Building the Docker Image

```bash
docker build -t portfolio-app .
```

### Running the Container

```bash
docker run -d \
  --name portfolio-app \
  --restart unless-stopped \
  -p 80:80 \
  -p 443:443 \
  -v $(pwd)/logs:/var/log/nginx \
  portfolio-app
```

## 🔒 SSL/HTTPS Setup

### Using Let's Encrypt (Free)

#### Automated SSL Setup

```bash
./deploy.sh --ssl --domain YOUR_DOMAIN
```

#### Manual SSL Setup

1. **Install Certbot** (on server):

```bash
# Ubuntu/Debian
apt-get update
apt-get install certbot

# Using Docker
certbot certonly --standalone -d portfolio.yourdomain.com
```

2. **Update nginx.conf**:

Uncomment the HTTPS server block in `nginx.production.conf`:

```nginx
server {
    listen 443 ssl http2;
    server_name portfolio.yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/portfolio.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/portfolio.yourdomain.com/privkey.pem;
    
    # ... rest of config
}
```

3. **Enable HTTPS Redirect**:

Add to HTTP server block:

```nginx
return 301 https://$server_name$request_uri;
```

4. **Renewal Setup**: Certbot auto-renewal is included

### Cloudflare SSL (Alternative)

1. Set DNS to proxy through Cloudflare
2. Use Flexible SSL in Cloudflare dashboard
3. No server-side certificate needed

## 🌐 DNS Configuration

### A Record Setup

In your domain registrar's DNS settings:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | SERVER_IP | Auto |
| A | www | SERVER_IP | Auto |

### Cloudflare DNS (Recommended)

1. Change nameservers to Cloudflare
2. Add A records pointing to your server
3. Enable SSL/TLS (Flexible or Full)

## 🔧 Server Setup Script

The `setup-server.sh` script automates server preparation:

```bash
# Run on fresh Kamatera server
bash setup-server.sh
```

This script will:
- Update system packages
- Install Docker and Docker Compose
- Configure firewall (UFW)
- Create application directory
- Install monitoring tools

## 📊 Monitoring and Logs

### Container Status

```bash
# View running containers
docker ps -a

# Check container health
docker inspect portfolio-app --format='{{.State.Health.Status}}'
```

### View Logs

```bash
# Docker container logs
docker logs portfolio-app

# Follow logs in real-time
docker logs -f portfolio-app

# Nginx access logs
docker exec portfolio-app tail -f /var/log/nginx/access.log

# Nginx error logs
docker exec portfolio-app tail -f /var/log/nginx/error.log
```

### Health Check

```bash
# Manual health check
curl -I http://localhost
# Should return: HTTP/1.1 200 OK

# Docker health check
docker exec portfolio-app wget --no-verbose --tries=1 --spider http://localhost
```

## 🛡️ Security Best Practices

### Server Security

1. **SSH Key Authentication Only**:
```bash
# /etc/ssh/sshd_config
PasswordAuthentication no
PermitRootLogin prohibit-password
```

2. **Firewall Configuration**:
```bash
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

3. **Automatic Updates**:
```bash
apt-get install unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades
```

### Application Security

- Security headers are pre-configured in nginx
- CSP (Content Security Policy) ready to add
- Rate limiting available in nginx configuration
- File access restrictions enforced

### Docker Security

- Run as non-root user (add user in Dockerfile)
- No unnecessary packages in final image
- Read-only filesystem option available
- Regular security scans recommended

## 🔄 CI/CD Pipeline

GitHub Actions workflow (`.github/workflows/kamatera-deploy.yml`) automates:

1. **Build**: Docker image compilation
2. **Test**: Configuration validation
3. **Security Scan**: Trivy vulnerability scan
4. **Deploy**: Automatic deployment to Kamatera

### Setup GitHub Secrets

In GitHub repository → Settings → Secrets:

- `KAMATERA_SERVER_IP` - Your server IP
- `SSH_USERNAME` - SSH username (root)
- `SSH_PRIVATE_KEY` - SSH private key
- `SSH_PORT` - SSH port (22)
- `DOMAIN` - Your domain (optional)

### Manual Trigger

```bash
gh workflow run kamatera-deploy.yml
```

## 📈 Performance Optimization

### Built-in Optimizations

1. **Gzip Compression** - Enabled in nginx
2. **Browser Caching** - 1-year cache for static assets
3. **HTTP/2** - Ready for SSL deployment
4. **Font Preloading** - Fonts preloaded in HTML
5. **Critical CSS** - Inlined for fast rendering

### Additional Optimizations

1. **Enable Brotli**:
```bash
apt-get install libnginx-mod-http-brotli
```

2. **CDN Integration**:
   - Configure Kamatera CDN
   - Add Cloudflare (free tier available)
   - Update DNS to point to CDN

3. **Image Optimization**:
   - Use WebP format
   - Implement lazy loading
   - Add srcset for responsive images

## 🔄 Maintenance

### Regular Tasks

**Daily**:
- Monitor logs for errors
- Check container health

**Weekly**:
- Review access logs
- Check for suspicious activity

**Monthly**:
- Update Docker base images
- Renew SSL certificates (if not auto-renewing)
- Review and rotate logs

**Quarterly**:
- Full system backup
- Review and update security policies
- Test backup restoration

### Updating the Application

```bash
# Pull latest changes
git pull origin main

# Rebuild and deploy
docker-compose up -d --build

# Clean up old images
docker image prune -f
```

### Backup and Recovery

```bash
# Backup container and data
docker commit portfolio-app portfolio-backup:$(date +%Y%m%d)
docker save portfolio-backup:$(date +%Y%m%d) > portfolio-backup.tar

# Restore from backup
docker load < portfolio-backup.tar
docker run -d --name portfolio-app -p 80:80 portfolio-backup:YYYYMMDD
```

## 🚨 Troubleshooting

### Common Issues

#### Container Won't Start

```bash
# Check logs
docker logs portfolio-app

# Check port conflicts
sudo netstat -tulnp | grep :80

# Restart with clean state
docker stop portfolio-app
docker rm portfolio-app
docker-compose up -d
```

#### Port 80 Already in Use

```bash
# Find process using port
sudo lsof -i :80

# Stop conflicting service
sudo systemctl stop apache2  # or nginx

# Restart container
docker restart portfolio-app
```

#### SSL Certificate Errors

```bash
# Check certificate validity
openssl x509 -in /etc/letsencrypt/live/DOMAIN/cert.pem -noout -dates

# Renew certificate
certbot renew

# Restart container
docker restart portfolio-app
```

#### Permission Denied

```bash
# Fix file permissions
sudo chown -R $USER:$USER /opt/portfolio
sudo chmod -R 755 /opt/portfolio

# Docker volume permissions
docker stop portfolio-app
docker rm portfolio-app
docker volume prune
docker-compose up -d
```

#### High CPU/Memory Usage

```bash
# Monitor resource usage
docker stats

# Check for memory leaks
docker exec portfolio-app top

# Consider scaling or optimizing
```

### Getting Help

```bash
# Kamatera support
https://cloud.kamatera.com/support/

# Docker documentation
https://docs.docker.com/

# Nginx documentation
https://nginx.org/en/docs/

# Certificate bot
https://certbot.eff.org/docs/
```

## 📝 Configuration Files

### Key Files Overview

- **Dockerfile** - Container image definition
- **docker-compose.yml** - Multi-container orchestration
- **nginx.conf** - HTTP configuration
- **nginx.production.conf** - HTTPS/SSL configuration
- **deploy.sh** - Automated deployment script
- **setup-server.sh** - Server initialization script
- **KAMATERA_DEPLOYMENT.md** - Detailed deployment guide
- **DEPLOYMENT_CHECKLIST.md** - Step-by-step checklist

### Customization

To customize for your needs:

1. **Update Domain**:
   - Edit `deploy.sh`: Set `DOMAIN` variable
   - Update `nginx.production.conf`: Change `server_name`

2. **Change Ports**:
   - Edit `docker-compose.yml`: Update port mappings
   - Modify `nginx.conf`: Change listen directives

3. **Add Features**:
   - Extend `Dockerfile`: Add additional software
   - Modify `nginx.conf`: Add new location blocks
   - Update deployment scripts: Add custom steps

## 🎉 Success!

Your portfolio is now deployed and accessible at:
- **HTTP**: http://YOUR_SERVER_IP
- **HTTPS**: https://YOUR_DOMAIN (after SSL setup)

### Next Steps

1. **Set up custom domain** (if not done)
2. **Enable SSL/HTTPS** (recommended)
3. **Configure CDN** (for better performance)
4. **Set up monitoring** (uptime checks, alerts)
5. **Configure backups** (regular automated backups)
6. **Add analytics** (Google Analytics, etc.)
7. **Implement CI/CD** (automatic deployments)

## 💡 Pro Tips

1. **Use Git** - Keep all changes version controlled
2. **Document Changes** - Maintain a changelog
3. **Monitor Regularly** - Set up uptime monitoring
4. **Test Deployments** - Always test in staging first
5. **Keep Updated** - Regularly update dependencies
6. **Use Environment Variables** - For sensitive configuration
7. **Enable 2FA** - On all accounts (Kamatera, GitHub, etc.)

## 📚 Additional Resources

- [Kamatera Documentation](https://www.kamatera.com/support/)
- [Docker Documentation](https://docs.docker.com/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt Documentation](https://certbot.eff.org/docs/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

---

*Last Updated: April 2026*
*Deployment Guide Version: 2.0*
