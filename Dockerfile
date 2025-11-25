FROM node:22-alpine
WORKDIR /app
RUN npm install -g pnpm
COPY package.json ./
RUN pnpm install
COPY . .
RUN pnpm build
EXPOSE 4321
CMD ["node", "./dist/server/entry.mjs"]