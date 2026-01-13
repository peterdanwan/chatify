#!/bin/bash

curl -X DELETE -H "Content-Type: application/json" --data-binary @_fixtures/delete-user.json localhost:3000/api/auth/delete-user -w '\n'