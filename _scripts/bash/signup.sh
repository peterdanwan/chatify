#!/bin/bash

# The -w is necessary. When we normally send a curl command in our terminal, we press "Enter" on our keyboard
# The -w here sends the command
curl -X POST -H "Content-Type: application/json" --data-binary @_fixtures/signup.json localhost:3000/api/auth/signup -w '\n'