#!/bin/bash
set -e

echo "================================"
echo "OpenCode Cursor Plugin Test Suite"
echo "================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track failures
FAILED=0

# Function to run a test and report results
run_test() {
    local name=$1
    local command=$2

    echo -n "Testing $name... "
    if eval "$command" > /tmp/test_output.log 2>&1; then
        echo -e "${GREEN}✓ PASS${NC}"
        return 0
    else
        echo -e "${RED}✗ FAIL${NC}"
        cat /tmp/test_output.log
        FAILED=1
        return 1
    fi
}

echo "Step 1: Build verification"
echo "--------------------------"
run_test "TypeScript compilation" "bun run build"
echo ""

echo "Step 2: Unit tests"
echo "------------------"
run_test "SessionManager" "bun test tests/unit/sessions.test.ts"
run_test "ToolMapper" "bun test tests/unit/tools.test.ts"
run_test "MetricsTracker" "bun test tests/unit/metrics.test.ts"
run_test "RetryEngine" "bun test tests/unit/retry.test.ts"
echo ""

echo "Step 3: Integration tests"
echo "-------------------------"
run_test "CursorAgent Integration" "bun test tests/integration/agent.test.ts"
echo ""

echo "Step 4: Package validation"
echo "--------------------------"
run_test "Package.json validation" "cat package.json | jq . > /dev/null"
run_test "Dist exports" "node -e \"const p = require('./dist/index.js'); if (!p.cursorProvider) throw new Error('Missing cursorProvider'); console.log('cursorProvider:', typeof p.cursorProvider);\""
echo ""

echo "Step 5: Import checks"
echo "---------------------"
run_test "Sessions module import" "bun -e \"import { SessionManager } from './src/acp/sessions.js'; console.log('OK');\""
run_test "Tools module import" "bun -e \"import { ToolMapper } from './src/acp/tools.js'; console.log('OK');\""
run_test "Metrics module import" "bun -e \"import { MetricsTracker } from './src/acp/metrics.js'; console.log('OK');\""
echo ""

echo "================================"
if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}All tests passed!${NC}"
    echo "================================"
    exit 0
else
    echo -e "${RED}Some tests failed!${NC}"
    echo "================================"
    exit 1
fi
