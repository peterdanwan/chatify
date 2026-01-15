#!/bin/bash

# The -w is necessary. When we normally send a curl command in our terminal, we press "Enter" on our keyboard
# The -w here sends the command
curl \
  -X POST `# Set the HTTP method` \
  -H "Content-Type: application/json" `# Set the Headers` \
  --data-binary @_fixtures/signup.json`# Send the Body (JSON payload) from the fixture file` \
  -c _fixtures/cookies/cookies.txt `# Capture the cookies the server sends back (our JWT token called, 'jwt') into cookies.txt` \
  localhost:3000/api/auth/signup `# Target URL` \
  -w '\n' `# Add newline for clean output`