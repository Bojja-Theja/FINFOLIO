#!/bin/bash

# CAPSTACK Dataset Integration & UI/UX Testing Script

echo "🧪 CAPSTACK Testing Suite"
echo "=========================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to print test result
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ PASS${NC}: $2"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}✗ FAIL${NC}: $2"
        ((TESTS_FAILED++))
    fi
}

echo "📦 Phase 1: Build Tests"
echo "----------------------"

# Test 1: Backend Build
echo -n "Testing backend build... "
cd /home/abdul/Documents/CAREER/CAPSTACK-2k25/backend-api
npm run build > /dev/null 2>&1
print_result $? "Backend TypeScript compilation"

# Test 2: Frontend Build  
echo -n "Testing frontend build... "
cd /home/abdul/Documents/CAREER/CAPSTACK-2k25/frontend
timeout 120 npm run build > /dev/null 2>&1
print_result $? "Frontend Next.js build"

echo ""
echo "📊 Phase 2: Dataset Tests"
echo "-------------------------"

# Test 3: Check dataset files exist
echo -n "Checking dataset files... "
DATASET_DIR="/home/abdul/Documents/CAREER/CAPSTACK-2k25/dataset"
if [ -f "$DATASET_DIR/Salary.csv" ] && \
   [ -f "$DATASET_DIR/turnover.csv" ] && \
   [ -f "$DATASET_DIR/stock/portfolio_data.csv" ] && \
   [ -f "$DATASET_DIR/linkedinbenefits.csv" ]; then
    print_result 0 "All dataset files present"
else
    print_result 1 "Missing dataset files"
fi

# Test 4: Verify dataset file sizes
echo -n "Verifying dataset integrity... "
SALARY_SIZE=$(wc -c < "$DATASET_DIR/Salary.csv")
TURNOVER_SIZE=$(wc -c < "$DATASET_DIR/turnover.csv")
if [ $SALARY_SIZE -gt 0 ] && [ $TURNOVER_SIZE -gt 0 ]; then
    print_result 0 "Dataset files are not empty"
else
    print_result 1 "Dataset files are empty"
fi

echo ""
echo "🔧 Phase 3: Code Quality Tests"
echo "------------------------------"

# Test 5: Check for TypeScript errors in new files
echo -n "Checking datasetService.ts... "
if [ -f "/home/abdul/Documents/CAREER/CAPSTACK-2k25/backend-api/dist/services/datasetService.js" ]; then
    print_result 0 "datasetService compiled successfully"
else
    print_result 1 "datasetService compilation failed"
fi

# Test 6: Check insights controller
echo -n "Checking insightsController.ts... "
if [ -f "/home/abdul/Documents/CAREER/CAPSTACK-2k25/backend-api/dist/controllers/insightsController.js" ]; then
    print_result 0 "insightsController compiled successfully"
else
    print_result 1 "insightsController compilation failed"
fi

# Test 7: Check insights routes
echo -n "Checking insightsRoutes.ts... "
if [ -f "/home/abdul/Documents/CAREER/CAPSTACK-2k25/backend-api/dist/routes/insightsRoutes.js" ]; then
    print_result 0 "insightsRoutes compiled successfully"
else
    print_result 1 "insightsRoutes compilation failed"
fi

echo ""
echo "🎨 Phase 4: UI Component Tests"
echo "------------------------------"

# Test 8: Check UI components exist
echo -n "Checking GlassCard component... "
if [ -f "/home/abdul/Documents/CAREER/CAPSTACK-2k25/frontend/src/components/ui/GlassCard.tsx" ]; then
    print_result 0 "GlassCard component created"
else
    print_result 1 "GlassCard component missing"
fi

# Test 9: Check GradientButton
echo -n "Checking GradientButton component... "
if [ -f "/home/abdul/Documents/CAREER/CAPSTACK-2k25/frontend/src/components/ui/GradientButton.tsx" ]; then
    print_result 0 "GradientButton component created"
else
    print_result 1 "GradientButton component missing"
fi

# Test 10: Check LoadingSkeleton
echo -n "Checking LoadingSkeleton component... "
if [ -f "/home/abdul/Documents/CAREER/CAPSTACK-2k25/frontend/src/components/ui/LoadingSkeleton.tsx" ]; then
    print_result 0 "LoadingSkeleton component created"
else
    print_result 1 "LoadingSkeleton component missing"
fi

# Test 11: Check AnimatedCounter
echo -n "Checking AnimatedCounter component... "
if [ -f "/home/abdul/Documents/CAREER/CAPSTACK-2k25/frontend/src/components/ui/AnimatedCounter.tsx" ]; then
    print_result 0 "AnimatedCounter component created"
else
    print_result 1 "AnimatedCounter component missing"
fi

# Test 12: Check SalaryInsights
echo -n "Checking SalaryInsights component... "
if [ -f "/home/abdul/Documents/CAREER/CAPSTACK-2k25/frontend/src/components/SalaryInsights.tsx" ]; then
    print_result 0 "SalaryInsights component created"
else
    print_result 1 "SalaryInsights component missing"
fi

echo ""
echo "📝 Phase 5: Dependencies Test"
echo "-----------------------------"

# Test 13: Check csv-parse installed
echo -n "Checking csv-parse dependency... "
cd /home/abdul/Documents/CAREER/CAPSTACK-2k25/backend-api
if npm list csv-parse > /dev/null 2>&1; then
    print_result 0 "csv-parse installed"
else
    print_result 1 "csv-parse not installed"
fi

# Test 14: Check compression installed
echo -n "Checking compression dependency... "
if npm list compression > /dev/null 2>&1; then
    print_result 0 "compression installed"
else
    print_result 1 "compression not installed"
fi

# Test 15: Check redis installed
echo -n "Checking redis dependency... "
if npm list redis > /dev/null 2>&1; then
    print_result 0 "redis installed"
else
    print_result 1 "redis not installed"
fi

echo ""
echo "📈 Test Summary"
echo "==============="
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"
echo "Total: $((TESTS_PASSED + TESTS_FAILED))"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed!${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️  Some tests failed. Please review the results above.${NC}"
    exit 1
fi
