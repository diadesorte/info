#!/bin/sh

docker compose run --rm nuxt3 sh -c "yarn install && yarn generate"
rm -rf ./docs
cp -r ./nuxt3/.output/public ./docs