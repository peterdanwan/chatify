#!/bin/bash

curl \
  -X POST `# Set the HTTP method` \
  -b _fixtures/cookies/cookies.txt  `# Send cookies from the file (logout works without it, but more realistic to send)` \
  localhost:3000/api/auth/logout  `# Target URL` \
  -w '\n' `# Add newline for clean output` \
  
# Explicitly delete the cookie file after logout
# - NOTE: The server sends a clearing cookie after the request above,
#   but it's cleaner to just remove the file
rm -f _fixtures/cookies/cookies.txt