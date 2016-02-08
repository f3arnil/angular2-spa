#!/bin/bash

CURRENT_DIR="$(pwd)"
TARGET_PATHS=(
  "."
  "./angular-spa-ui"
)

for ((i = 0; i < ${#TARGET_PATHS[*]}; i++));
do
  CURRENT_SCRIPT_PATH=${TARGET_PATHS[$i]}
  echo "### => Opening $CURRENT_SCRIPT_PATH of $CURRENT_DIR folder and trying to build package.json"

  cd $CURRENT_DIR
  cd $CURRENT_SCRIPT_PATH
  npm install
done
