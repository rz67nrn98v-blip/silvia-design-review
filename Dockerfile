FROM node:20-alpine
WORKDIR /app
COPY package.json ./
COPY server.js ./
COPY plaid-server.js ./
COPY index.html ./
COPY README.md ./
COPY CORE-PLAN.md ./
COPY CORE-V1-SCREEN-MAP.md ./
COPY SILVIA-CORE-ENGINE.md ./
COPY railway.toml ./
COPY downloads ./downloads
COPY shell ./shell
COPY shots ./shots
COPY tokens ./tokens
ENV PORT=8080
EXPOSE 8080
CMD ["node", "server.js"]
