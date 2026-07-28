FROM caddy:2-alpine
COPY Caddyfile /etc/caddy/Caddyfile
# Render sets PORT; Caddyfile uses {$PORT}
ENV PORT=10000
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]
