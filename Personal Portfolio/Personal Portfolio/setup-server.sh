#!/bin/bash
# Kamatera Server Setup Script
# Run this on your fresh Kamatera server to prepare it for deployment

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}=== Kamatera Server Setup ===${NC}"

# Update system
echo -e "${YELLOW}Updating system...${NC}"
apt-get update -y
apt-get upgrade -y

# Install Docker
echo -e "${YELLOW}Installing Docker...${NC}"
curl -fsSL https://get.docker.com | sh

# Install Docker Compose
echo -e "${YELLOW}Installing Docker Compose...${NC}"
apt-get install -y docker-compose-plugin

# Configure firewall
echo -e "${YELLOW}Configuring firewall...${NC}"
apt-get install -y ufw
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# Create app directory
echo -e "${YELLOW}Creating application directory...${NC}"
mkdir -p /opt/portfolio
chown -R $USER:$USER /opt/portfolio

# Create log directory
mkdir -p /opt/portfolio/logs

# Install monitoring tools (optional)
echo -e "${YELLOW}Installing monitoring tools...${NC}"
apt-get install -y htop net-tools curl

echo -e "${GREEN}=== Setup Complete ===${NC}"
echo -e "${GREEN}Server is ready for portfolio deployment!${NC}"
echo ""
echo "Next steps:"
echo "1. Copy your portfolio files to /opt/portfolio/"
echo "2. Run: docker-compose up -d"
echo "3. Access your site at http://<server-ip>"
echo ""
echo "To deploy from your local machine:"
echo "  ./deploy.sh --remote --host <server-ip>"
