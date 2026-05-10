#!/bin/bash

# Vercel Ignore Build Step
# 1 = Build, 0 = Ignore

echo "🔍 Vercel Ignore Check"
echo "Ref: $VERCEL_GIT_COMMIT_REF"

if [[ "$VERCEL_GIT_COMMIT_REF" == "fix/ci-stabilization" ]] ; then
  echo "✅ Ignored build for stabilization branch."
  exit 0
else
  echo "🚀 Proceeding with build for: $VERCEL_GIT_COMMIT_REF"
  exit 1
fi
