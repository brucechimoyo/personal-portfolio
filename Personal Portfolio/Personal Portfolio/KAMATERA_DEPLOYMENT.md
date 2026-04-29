# Kamatera Deployment Guide for Personal Portfolio

## Overview
This guide covers deploying the Personal Portfolio website to Kamatera cloud infrastructure using Docker containers.

## Prerequisites
- Kamatera cloud server (minimum: 1 vCPU, 1GB RAM)
- Domain name (optional but recommended)
- SSH access to server
- Docker installed (or use provided deployment script)

## Quick Start

### Option 1: Automated Deployment (Recommended)
```bash
# Deploy locally with Docker
./deploy.sh --docker

# Deploy to remote Kamatera server
./deploy.sh --remote --host YOUR_SERVER_IP --user root

# Setup SSL certificate
./deploy.sh --ssl --domain your-domain.com
```

### Option 2: Manual Deployment

#### Step 1: Install Docker
```bash
curl -fsSL https://get.docker.com | sh
sudo systemctl start docker
sudo systemctl enable docker
```

#### Step 2: Deploy Application
```bash
# Navigate to project directory
cd Personal\ Portfolio

# Build Docker image
docker build -t portfolio-app .

# Run container
docker run -d \
  --name portfolio-app \
  --restart unless-stopped \
  -p 80:80 \
  -p 443:443 \
  -v $(pwd)/logs:/var/log/nginx \
  portfolio-app
```

#### Step 3: Verify Deployment
```bash
curl http://localhost
# or access via browser at http://your-server-ip
```

## SSL Configuration with Let's Encrypt

### Automated SSL Setup
```bash
./deploy.sh --ssl --domain your-domain.com
```

### Manual SSL Setup

1. Install Certbot:
```bash
apt-get update
apt-get install certbot
```

2. Obtain Certificate:
```bash
certbot certonly --standalone -d your-domain.com -d www.your-domain.com
```

3. Update nginx.conf:
   - Uncomment the HTTPS server block
   - Update `ssl_certificate` paths

4. Reload nginx:
```bash
docker restart portfolio-app
```

## Firewall Configuration

Open required ports on Kamatera firewall:
- HTTP: Port 80
- HTTPS: Port 443
- SSH: Port 22 (for management)

```bash
# Using ufw (if available)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
```

## Monitoring

### Check Container Status
```bash
docker ps -a
docker logs portfolio-app
```

### View Access Logs
```bash
docker exec portfolio-app tail -f /var/log/nginx/access.log
```

### Health Check
```bash
curl -I http://localhost
# Should return HTTP 200
```

## Backup and Recovery

### Backup Application Data
```bash
# Backup Docker container
docker commit portfolio-app portfolio-backup:$(date +%Y%m%d)

# Save to file
docker save portfolio-backup:$(date +%Y%m%d) > portfolio-backup.tar
```

### Restore from Backup
```bash
docker load < portfolio-backup.tar
docker run -d --name portfolio-app -p 80:80 portfolio-backup:YYYYMMDD
```

## Scaling

### Horizontal Scaling with Load Balancer
For high-traffic scenarios, deploy multiple instances behind a load balancer.

1. Deploy multiple containers on different ports:
```bash
docker run -d --name portfolio-app-1 -p 8001:80 portfolio-app
docker run -d --name portfolio-app-2 -p 8002:80 portfolio-app
```

2. Configure nginx or Kamatera Load Balancer to distribute traffic.

## Troubleshooting

### Container Won't Start
```bash
docker logs portfolio-app
# Check for port conflicts or configuration errors
```

### Permission Denied Errors
```bash
# Ensure proper file permissions
sudo chown -R $USER:$USER /opt/portfolio
```

### SSL Certificate Issues
```bash
# Check certificate expiration
openssl x509 -in /etc/letsencrypt/live/your-domain.com/cert.pem -noout -dates

# Renew certificate
certbot renew
```

## Performance Optimization

### Enable CDN
- Configure Kamatera CDN
- Update DNS to point to CDN endpoint

### Cache Configuration
- Static assets cached for 1 year
- HTML files not cached
- Enable HTTP/2 for better performance

### Compression
- Gzip compression enabled in nginx
- Brotli compression recommended for additional savings

## Security Best Practices

1. Keep Docker updated
2. Use non-root user for application
3. Enable automatic security updates
4. Monitor logs regularly
5. Use SSH keys instead of passwords
6. Implement rate limiting in nginx
7. Regular backups

## Cost Optimization

- Use Kamatera's auto-scaling for traffic spikes
- Schedule server shutdown during off-hours (if applicable)
- Use reserved instances for long-term savings
- Monitor bandwidth usage with Kamatera dashboard

## Support and Maintenance

- Regular updates: Monthly security patches
- Log rotation: Configure log rotation to prevent disk space issues
- Monitoring: Set up alerts for CPU, memory, and disk usage
- Backups: Weekly automated backups recommended
