FROM node:22-alpine

WORKDIR /app

RUN addgroup -S provareal && adduser -S provareal -G provareal && \
    mkdir -p /app/dados && chown -R provareal:provareal /app

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY src ./src
RUN chown -R provareal:provareal /app

USER provareal
EXPOSE 8787

CMD ["node", "--no-warnings=ExperimentalWarning", "src/indice.js"]
