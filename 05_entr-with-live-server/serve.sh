#!/bin/bash
export ENTR_INOTIFY_WORKAROUND=1
echo mystyles.scss | entr -pn sass --no-source-map mystyles.scss mystyles.css &
ENTR_PID=$!
npx live-server --watch=mystyles.css
kill $ENTR_PID
