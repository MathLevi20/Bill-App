#!/bin/bash

# Create placeholder images for the public folder
mkdir -p public
mkdir -p src/assets

# Create an empty favicon.ico (1x1 pixel)
touch public/favicon.ico

# Create empty PNG files
touch public/logo192.png
touch public/logo512.png
touch src/assets/logo.png

echo "Placeholder files created. Replace them with actual images later."
