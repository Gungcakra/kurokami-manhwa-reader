FROM node:20-alpine

# Set workdir
WORKDIR /app

# Copy package.json dan lock
COPY package*.json ./

# Install dependency
RUN npm install

# Copy project
COPY . .

# Build Astro
RUN npm run build

# Port default adapter-node = 4321
EXPOSE 4321

# Run Astro
CMD ["node", "./dist/server/entry.mjs"]
