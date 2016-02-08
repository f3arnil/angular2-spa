#!/bin/bash
ENV_DEV="Development"
ENV_PROD="Production"
USER_ANONYMOUS_ID="563b3f1ce8d64c3f52ad008d"
USER_NORMAL_ID="563b3f77e8d64c3f52ad008e"
USER_ADMIN_ID="563b4018e8d64c3f52ad008f"

ENV_PROMPT="Select running configuration: "
USER_PROMPT="Select source user: "

ENV_OPTIONS=($ENV_DEV $ENV_PROD)
USER_OPTIONS=("Anonymous" "Regular" "Admin")

PS3="$ENV_PROMPT"

select opt in "${ENV_OPTIONS[@]}" "Escape"; do
  case "$REPLY" in
    1)  echo "Starting $ENV_DEV configuration";
        TARGET_ENV=$ENV_DEV; break;;
    2)  echo "Starting $ENV_PROD configuration";
        TARGET_ENV=$ENV_PROD; break;;

    $(( ${#ENV_OPTIONS[@]}+1 )) ) echo "Goodbye!"; break;;
    *) echo "Invalid option. Try another one.";continue;;

  esac
done

PS3="$USER_PROMPT"

select opt in "${USER_OPTIONS[@]}" "Escape"; do
  case "$REPLY" in
    1)  echo "Using anonymous profile";
        TARGET_USER=$USER_ANONYMOUS_ID; break;;
    2)  echo "Using regular user profile";
        TARGET_USER=$USER_NORMAL_ID; break;;
    3)  echo "Using admin user profile";
        TARGET_USER=$USER_ADMIN_ID; break;;

    $(( ${#USER_OPTIONS[@]}+1 )) ) echo "Goodbye!"; break;;
    *) echo "Invalid option. Try another one.";continue;;

  esac
done

export NODE_ENV=$TARGET_ENV
export NODE_USER_ID=$TARGET_USER

cd "angular-spa-ui"
webpack
cd ".."
node app.js;
