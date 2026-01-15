#!/bin/bash

curl \
  -X DELETE `# Set the HTTP method` \
  -H "Content-Type: application/json" `# Set the Headers` \
  --data-binary @_fixtures/delete-user.json `# Send the Body (JSON payload) from the fixture file` \
  -b _fixtures/cookies/cookies.txt `# Send cookies from the file` \
  -c _fixtures/cookies/cookies.txt `# Capture the cookies the server sends back into cookies.txt` \
  localhost:3000/api/auth/delete-user `# Target URL` \
  -w '\n' `# Add newline for clean output`