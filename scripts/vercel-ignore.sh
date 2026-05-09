#!/bin/bash

echo "VERCEL_GIT_COMMIT_REF: $VERCEL_GIT_COMMIT_REF"

if [[ "$VERCEL_GIT_COMMIT_REF" == "fix/ci-stabilization" ]] ; then
  # Don't build this branch
  echo "✅ Ignored build for branch: $VERCEL_GIT_COMMIT_REF"
  exit 0;
else
  # Proceed with build for other branches
  echo "🚀 Proceeding with build for branch: $VERCEL_GIT_COMMIT_REF"
  exit 1;
fi
