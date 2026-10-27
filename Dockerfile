FROM nginx:alpine
LABEL authors="artembahetkin"

COPY index.html styles.css script.js /usr/share/nginx/html/