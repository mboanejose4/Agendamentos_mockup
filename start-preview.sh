#!/usr/bin/env bash
cd "$(dirname "$0")/preview" || exit 1
python3 -m http.server 8080
