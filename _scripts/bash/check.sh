#!/bin/bash
# _scripts/bash/check.sh

curl \
  -X GET `# Set the HTTP method` \
  -b _fixtures/cookies/cookies.txt `# Send cookie from file (curl parses Netscape format)` \
  localhost:3000/api/auth/check `# Target URL` \
  -w '\n' `# Add newline for clean output`