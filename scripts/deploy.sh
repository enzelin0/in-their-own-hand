#!/bin/sh
# Builds the site and publishes dist/ to the gh-pages branch, which GitHub Pages serves.
set -e
cd "$(dirname "$0")/.."
remote=$(git remote get-url origin)
name=$(git config user.name)
email=$(git config user.email)
npm run build
cd dist
touch .nojekyll
rm -rf .git
git init -q -b gh-pages
git add -A
git -c user.name="$name" -c user.email="$email" commit -q -m "Deploy site"
git push -q -f "$remote" gh-pages
rm -rf .git
echo "Published to the gh-pages branch. The live page updates within a minute or two."
