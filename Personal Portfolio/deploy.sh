#!/bin/bash
# Kamatera Deployment Script for Personal Portfolio
# This script automates deployment to Kamatera cloud server

set -e

# Configuration
SERVER_USER="root"
SERVER_HOST="your-server-ip"  # Replace with your Kamatera server IP
SERVER_PORT="22"
APP_DIR="/opt/portfolio"
DOMAIN="your-domain.com"  # Replace with your domain (optional)

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    if ! command -v docker &> /dev/null; then
        log_warn "Docker not found. Installing..."
        install_docker
    fi
    
    if ! command -v ssh &> /dev/null; then
        log_error "SSH is required but not installed. Please install OpenSSH client."
        exit 1
    fi
    
    log_info "All prerequisites met."
}

# Install Docker on Ubuntu/Debian
install_docker() {
    log_info "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    sudo usermod -aG docker $USER
    log_info "Docker installed successfully."
}

# Deploy using Docker
deploy_docker() {
    log_info "Deploying with Docker..."
    
    cd Personal\ Portfolio
    
    # Build Docker image
    log_info "Building Docker image..."
    docker build -t portfolio-app .
    
    # Stop and remove existing container
    log_info "Stopping existing container..."
    docker stop portfolio-app 2>/dev/null || true
    docker rm portfolio-app 2>/dev/null || true
    
    # Run new container
    log_info "Starting new container..."
    docker run -d \
        --name portfolio-app \
        --restart unless-stopped \
        -p 80:80 \
        -p 443:443 \
        -v $(pwd)/logs:/var/log/nginx \
        portfolio-app
    
    log_info "Docker deployment complete!"
    log_info "Website available at: http://localhost"
}

# Deploy to remote Kamatera server
deploy_remote() {
    log_info "Deploying to remote Kamatera server: $SERVER_HOST"
    
    # Create deployment archive
    log_info "Creating deployment archive..."
    tar -czf portfolio.tar.gz \
        --exclude='.git' \
        --exclude='node_modules' \
        --exclude='*.tar.gz' \
        -C .. Personal\ Portfolio
    
    # Copy to remote server
    log_info "Copying files to server..."
    scp -P $SERVER_PORT \
        portfolio.tar.gz \
        $SERVER_USER@$SERVER_HOST:/tmp/
    
    # Deploy on remote server
    log_info "Deploying on remote server..."
    ssh -p $SERVER_PORT $SERVER_USER@$SERVER_HOST << 'EOF'
        # Create app directory
        mkdir -p /opt/portfolio
        
        # Extract files
        tar -xzf /tmp/portfolio.tar.gz -C /opt/portfolio --strip-components=1
        
        # Clean up
        rm /tmp/portfolio.tar.gz
        
        # Install Docker if not present
        if ! command -v docker &> /dev/null; then
            curl -fsSL https://get.docker.com | sh
        fi
        
        # Start Docker service
        systemctl start docker || service docker start
        
        # Deploy application
        cd /opt/portfolio
        docker build -t portfolio-app .
        docker stop portfolio-app 2>/dev/null || true
        docker rm portfolio-app 2>/dev/null || true
        docker run -d \
            --name portfolio-app \
            --restart unless-stopped \
            -p 80:80 \
            -p 443:443 \
            portfolio-app
        
        echo "Deployment complete!"
EOF
    
    # Clean up local archive
    rm portfolio.tar.gz
    
    log_info "Remote deployment complete!"
    log_info "Website available at: http://$SERVER_HOST"
}

# Setup SSL with Let's Encrypt
setup_ssl() {
    log_info "Setting up SSL certificate..."
    
    if [ -z "$DOMAIN" ] || [ "$DOMAIN" = "your-domain.com" ]; then
        log_warn "Domain not configured. Skipping SSL setup."
        log_info "Edit this script and set DOMAIN variable to enable SSL."
        return
    fi
    
    log_info "Obtaining SSL certificate for $DOMAIN..."
    
    # Run certbot
    docker run -it --rm \
        -v $(pwd)/certbot/conf:/etc/letsencrypt \
        -v $(pwd)/certbot/www:/var/www/certbot \
        certbot/certbot certonly \
        --webroot \
        --webroot-path=/var/www/certbot \
        -d $DOMAIN \
        -d www.$DOMAIN
    
    log_info "SSL certificate obtained!"
    
    # Update nginx config for SSL
    log_info "Updating nginx configuration..."
    sed -i 's/# server {/server {/' nginx.conf
    sed -i 's/#     listen 443/    listen 443/' nginx.conf
    
    log_info "Restart container to apply SSL..."
    docker restart portfolio-app
}

# Show usage
show_usage() {
    cat << USAGE
Usage: $0 [OPTIONS]

Deploy Personal Portfolio to Kamatera

OPTIONS:
    -h, --help          Show this help message
    -d, --docker        Deploy using Docker locally
    -r, --remote        Deploy to remote Kamatera server
    -s, --ssl           Setup SSL certificate (requires domain)
    -u, --update        Update remote server configuration
    --domain DOMAIN     Set domain name for SSL
    --host HOST         Set remote server IP/hostname
    --port PORT         Set SSH port (default: 22)
    --user USER         Set SSH user (default: root)

EXAMPLES:
    $0 --docker                    # Deploy locally with Docker
    $0 --remote --host 1.2.3.4    # Deploy to remote server
    $0 --ssl --domain example.com  # Setup SSL certificate

USAGE
}

# Main execution
main() {
    local action=""
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_usage
                exit 0
                ;;
            -d|--docker)
                action="docker"
                shift
                ;;
            -r|--remote)
                action="remote"
                shift
                ;;
            -s|--ssl)
                action="ssl"
                shift
                ;;
            --domain)
                DOMAIN="$2"
                shift 2
                ;;
            --host)
                SERVER_HOST="$2"
                shift 2
                ;;
            --port)
                SERVER_PORT="$2"
                shift 2
                ;;
            --user)
                SERVER_USER="$2"
                shift 2
                ;;
            *)
                log_error "Unknown option: $1"
                show_usage
                exit 1
                ;;
        esac
    done
    
    # Validate configuration
    if [ "$action" = "remote" ] && [ "$SERVER_HOST" = "your-server-ip" ]; then
        log_error "Please set SERVER_HOST or use --host option"
        exit 1
    fi
    
    # Execute action
    case $action in
        docker)
            check_prerequisites
            deploy_docker
            ;;
        remote)
            deploy_remote
            ;;
        ssl)
            setup_ssl
            ;;
        *)
            log_error "No action specified"
            show_usage
            exit 1
            ;;
    esac
}

main "$@"
