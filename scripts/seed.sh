#!/bin/bash

# Seed script for Gupta Mobile Centre
# Run: pnpm db:seed
# This runs the TypeScript seed script in scripts/seed.ts

set -e

echo "Running seed..."

# Change to apps/api directory and run the seed script
cd "$(dirname "$0")/../apps/api"
npx ts-node ../../scripts/seed.ts

echo "Seed completed!"