#!/bin/bash

# 🎯 Quick API Test Script
# This script tests the Driving School Management System API

BASE_URL="http://localhost:8080/api/v1"
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "🚀 Testing Driving School Management System API"
echo "================================================"
echo ""

# Step 1: Login
echo -e "${BLUE}1. Logging in as admin...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "auth": {
      "email": "admin@drivingschool.et",
      "password": "Password123!"
    }
  }')

# Extract token (works with both old and new response format)
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"jwt":"[^"]*' | cut -d'"' -f4)
fi

if [ -z "$TOKEN" ]; then
  echo -e "${RED}❌ Login failed!${NC}"
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✅ Login successful!${NC}"
echo "Token: ${TOKEN:0:50}..."
echo ""

# Step 2: Test Students API
echo -e "${BLUE}2. Fetching students...${NC}"
STUDENTS=$(curl -s "$BASE_URL/students" \
  -H "Authorization: Bearer $TOKEN")
echo "$STUDENTS" | head -20
echo ""

# Step 3: Test Finance Module - Invoices
echo -e "${BLUE}3. Testing Finance Module - Invoices...${NC}"
INVOICES=$(curl -s "$BASE_URL/invoices" \
  -H "Authorization: Bearer $TOKEN")
echo "$INVOICES"
echo ""

# Step 4: Test Finance Module - Financial Reports
echo -e "${BLUE}4. Testing Finance Module - Financial Reports Summary...${NC}"
REPORTS=$(curl -s "$BASE_URL/financial_reports/summary" \
  -H "Authorization: Bearer $TOKEN")
echo "$REPORTS"
echo ""

# Step 5: Test LMS Module - Attendance
echo -e "${BLUE}5. Testing LMS Module - Attendance Logs...${NC}"
ATTENDANCE=$(curl -s "$BASE_URL/students/1/attendance_logs" \
  -H "Authorization: Bearer $TOKEN")
echo "$ATTENDANCE" | head -20
echo ""

# Step 6: Test Batches
echo -e "${BLUE}6. Testing Batches...${NC}"
BATCHES=$(curl -s "$BASE_URL/batches" \
  -H "Authorization: Bearer $TOKEN")
echo "$BATCHES"
echo ""

# Step 7: Test Current User
echo -e "${BLUE}7. Getting current user info...${NC}"
ME=$(curl -s "$BASE_URL/auth/me" \
  -H "Authorization: Bearer $TOKEN")
echo "$ME"
echo ""

echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}✅ API Testing Complete!${NC}"
echo ""
echo "💡 Tips:"
echo "  - Backend running on: http://localhost:8080"
echo "  - Frontend running on: http://localhost:3000"
echo "  - Your Finance Module endpoints:"
echo "    • GET  /api/v1/invoices"
echo "    • POST /api/v1/invoices/:id/record_payment"
echo "    • GET  /api/v1/financial_reports/summary"
echo "    • GET  /api/v1/financial_reports/revenue"
echo "    • GET  /api/v1/financial_reports/collections"
echo ""
echo "🔐 Test credentials:"
echo "  Email: admin@drivingschool.et"
echo "  Password: Password123!"
