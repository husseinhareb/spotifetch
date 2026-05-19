# syntax=docker/dockerfile:1

FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci --no-audit --fund=false

COPY . .

ARG REACT_APP_API_URL
ARG PUBLIC_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV PUBLIC_URL=$PUBLIC_URL

RUN npm run build

FROM nginx:stable-alpine AS runtime

RUN rm /etc/nginx/conf.d/default.conf \
  && printf '%s\n' \
    'server {' \
    '  listen 80;' \
    '  server_name _;' \
    '' \
    '  root /usr/share/nginx/html;' \
    '  index index.html;' \
    '' \
    '  location / {' \
    '    try_files $uri $uri/ /index.html;' \
    '  }' \
    '' \
    '  location /static/ {' \
    '    expires 1y;' \
    '    add_header Cache-Control "public, immutable";' \
    '    try_files $uri =404;' \
    '  }' \
    '' \
    '  location = /asset-manifest.json {' \
    '    add_header Cache-Control "no-cache";' \
    '    try_files $uri =404;' \
    '  }' \
    '' \
    '  location = /manifest.json {' \
    '    add_header Cache-Control "no-cache";' \
    '    try_files $uri =404;' \
    '  }' \
    '}' \
  > /etc/nginx/conf.d/default.conf

COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s \
  CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1

CMD ["nginx", "-g", "daemon off;"]
