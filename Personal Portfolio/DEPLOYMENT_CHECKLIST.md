# Kamatera Deployment Checklist

## Prerequisites
- [ ] Kamatera account with active cloud server
- [ ] SSH key pair generated
- [ ] Domain name (optional but recommended)

## Server Setup
- [ ] Create Kamatera cloud server (1 vCPU, 1GB RAM minimum)
- [ ] Configure firewall (open ports 80, 443, 22)
- [ ] Set up DNS record (A record pointing to server IP)
- [ ] Run `setup-server.sh` on new server
- [ ] Verify SSH access to server

## Application Configuration
- [ ] Update `deploy.sh` with server IP and credentials
- [ ] Configure domain in `nginx.conf` (if using)
- [ ] Set up environment variables (if needed)
- [ ] Test Docker build locally

## Deployment Methods

### Method 1: Automated (Recommended)
- [ ] Run `./deploy.sh --docker` for local testing
- [ ] Run `./deploy.sh --remote --host YOUR_IP` for deployment
- [ ] Verify deployment: `curl http://YOUR_SERVER_IP`

### Method 2: Using CI/CD
- [ ] Configure GitHub Secrets:
  - KAMATERA_SERVER_IP
  - SSH_USERNAME
  - SSH_PRIVATE_KEY
  - SSH_PORT
  - DOMAIN (optional)
- [ ] Push changes to trigger pipeline
- [ ] Monitor deployment in GitHub Actions

## SSL Configuration (Optional)
- [ ] Update domain in deployment scripts
- [ ] Run `./deploy.sh --ssl --domain YOUR_DOMAIN`
- [ ] Verify SSL: `curl https://YOUR_DOMAIN`
- [ ] Set up auto-renewal

## Post-Deployment
- [ ] Verify website accessibility
- [ ] Test all pages and functionality
- [ ] Monitor logs: `docker logs portfolio-app`
- [ ] Set up monitoring/alerts
- [ ] Configure backups

## Monitoring
- [ ] Check container status: `docker ps`
- [ ] View access logs: `docker logs portfolio-app`
- [ ] Monitor resource usage: `docker stats`
- [ ] Set up health checks

## Security Checklist
- [ ] SSH keys configured (no password login)
- [ ] Firewall rules applied
- [ ] SSL/TLS enabled (if using domain)
- [ ] Security headers configured
- [ ] Docker image updated to latest version
- [ ] Secrets not stored in repository
- [ ] Regular backups configured

## Performance Checklist
- [ ] CDN configured (optional)
- [ ] Caching headers set correctly
- [ ] Gzip/Brotli compression enabled
- [ ] HTTP/2 enabled (with SSL)
- [ ] Images optimized
- [ ] Lazy loading implemented

## Maintenance
- [ ] Schedule weekly container updates
- [ ] Set up log rotation
- [ ] Monitor disk space
- [ ] Review access logs regularly
- [ ] Update dependencies monthly
- [ ] Test backup restoration quarterly

## Troubleshooting

### Container won't start
```bash
docker logs portfolio-app
docker ps -a
```

### Port already in use
```bash
sudo netstat -tulnp | grep :80
sudo lsof -i :80
```

### SSL certificate issues
```bash
# Check certificate
docker exec portfolio-app openssl x509 -in /etc/letsencrypt/live/DOMAIN/cert.pem -noout -dates

# Renew certificate
certbot renew
```

### High resource usage
```bash
docker stats
# Consider scaling or optimizing
```
