# JSON-Based Testing for Micro-Planning Service

This document describes the JSON-based testing approach for end-to-end testing of the scheduling and Excel export functionality without requiring database setup.

## Overview

The JSON testing path provides a complete alternative to database-based testing, allowing you to:

- Test the complete scheduling pipeline (data loading → domain conversion → scheduling → Excel export)
- Validate complex constraint interactions with realistic data
- Generate Excel files for manual inspection
- Perform end-to-end testing without database dependencies

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Controller    │───▶│ JsonScheduling │───▶│  JsonData       │
│   (/json/*)     │    │   Service      │    │   Service       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                       │
                                ▼                       ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │   Scheduler     │    │   mock_data.    │
                       │   (unchanged)   │    │      json       │
                       └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │ Excel Export    │
                       │   Service       │
                       └─────────────────┘
```

## API Endpoints

### JSON-Based Scheduling

#### `POST /api/scheduling/json/schedule`
Generate a schedule using JSON mock data and return the result as JSON.

**Request Body:**
```json
{
  "promotionId": "22222222-2222-2222-2222-222222222221",
  "startDate": "2024-01-08",
  "endDate": "2024-01-12"
}
```

**Response:**
```json
{
  "scheduleId": null,
  "success": true,
  "data": {
    "schedule": {...},
    "assignments": {...}
  },
  "totalCourses": 5,
  "message": "Scheduling completed successfully"
}
```

#### `POST /api/scheduling/json/schedule/export`
Generate a schedule using JSON mock data and return it as an Excel file.

**Request Body:** Same as above

**Response:** Excel file download with filename `json_schedule_Promotion_{id}_{timestamp}.xlsx`

## Mock Data Structure

The `mock_data.json` file contains realistic test data:

```json
{
  "cycle": [...],
  "promotion": [
    {
      "id": "22222222-2222-2222-2222-222222222221",
      "nom": "ING1",
      "effectifs": 120,
      "id_cycle": "11111111-1111-1111-1111-111111111111",
      "date_start": "2024-09-01",
      "date_end": "2025-06-30"
    }
  ],
  "professeur": [...],
  "matiere": [...],
  "enseignement": [...],
  "salle": [...],
  "event": [...],
  "localisation": [...]
}
```

## Testing Examples

### Using curl

#### Generate Schedule (JSON Response)
```bash
curl -X POST http://localhost:8080/api/scheduling/json/schedule \
  -H "Content-Type: application/json" \
  -d '{
    "promotionId": "22222222-2222-2222-2222-222222222221",
    "startDate": "2024-01-08",
    "endDate": "2024-01-12"
  }'
```

#### Generate and Export Excel
```bash
curl -X POST http://localhost:8080/api/scheduling/json/schedule/export \
  -H "Content-Type: application/json" \
  -d '{
    "promotionId": "22222222-2222-2222-2222-222222222221",
    "startDate": "2024-01-08",
    "endDate": "2024-01-12"
  }' \
  --output schedule.xlsx
```

### Using Postman/JavaScript

```javascript
// Schedule generation
fetch('/api/scheduling/json/schedule', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    promotionId: '22222222-2222-2222-2222-222222222221',
    startDate: '2024-01-08',
    endDate: '2024-01-12'
  })
}).then(r => r.json());

// Excel export
fetch('/api/scheduling/json/schedule/export', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    promotionId: '22222222-2222-2222-2222-222222222221',
    startDate: '2024-01-08',
    endDate: '2024-01-12'
  })
}).then(r => r.blob())
  .then(blob => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'schedule.xlsx';
    a.click();
  });
```

## Available Promotion IDs

- `22222222-2222-2222-2222-222222222221` - ING1 (120 students)
- `22222222-2222-2222-2222-222222222222` - ING2 (110 students)
- `22222222-2222-2222-2222-222222222223` - ING3 (100 students)

## Benefits

### ✅ **Isolated Testing**
- Zero impact on existing database code
- Complete separation from production endpoints
- Safe experimentation with realistic data volumes

### ✅ **End-to-End Validation**
- Real scheduling logic with complex constraints
- Actual Excel generation with multiple promotions
- Performance testing with substantial datasets

### ✅ **Easy Maintenance**
- JSON file can be easily modified for different scenarios
- No database setup required for testing
- Version controlled test data

## Running Tests

### Unit Tests
```bash
mvn test -Dtest=JsonDataServiceTest
mvn test -Dtest=JsonSchedulingServiceTest
mvn test -Dtest=SchedulingControllerJsonTest
```

### Integration Testing

#### Start Application in JSON-Only Mode (No Database Required)
```bash
# Disable database auto-configuration for JSON-only testing
export DB_AUTOCONFIGURE_EXCLUDE="org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration,org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration"
mvn spring-boot:run
```

#### Test the JSON Endpoints
```bash
# Test scheduling with JSON data (returns JSON result)
curl -X POST http://localhost:8080/api/scheduling/json/schedule \
  -H "Content-Type: application/json" \
  -d '{
    "promotionId": "22222222-2222-2222-2222-222222222221",
    "startDate": "2024-01-08",
    "endDate": "2024-01-12"
  }'

# Test Excel export with JSON data (downloads Excel file)
curl -X POST http://localhost:8080/api/scheduling/json/schedule/export \
  -H "Content-Type: application/json" \
  -d '{
    "promotionId": "22222222-2222-2222-2222-222222222221",
    "startDate": "2024-01-08",
    "endDate": "2024-01-12"
  }' \
  --output test_schedule.xlsx
```

#### Alternative: Using Environment Variable
```bash
# Set environment variable and start
DB_AUTOCONFIGURE_EXCLUDE="org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration,org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration" \
mvn spring-boot:run
```

## Modifying Test Data

To modify the test scenarios:

1. Edit `src/main/resources/mock_data.json`
2. Add/modify promotions, subjects, professors, rooms
3. Adjust teaching assignments and constraints
4. Test with different promotion IDs and date ranges

## Troubleshooting

### Common Issues

#### "Promotion not found"
- Verify the `promotionId` matches an ID in `mock_data.json`
- Check UUID format (should be 36 characters with dashes)

#### "No feasible schedule found"
- The scheduling algorithm couldn't find a valid solution
- Try different date ranges or modify constraints in the data

#### Excel file is empty/corrupted
- Check that scheduling succeeded first (use `/json/schedule` endpoint)
- Verify ExcelExportService dependencies are available

#### Application won't start
- Ensure `mock_data.json` is in `src/main/resources/`
- Check that Jackson dependency is in `pom.xml`
- Verify JSON syntax is valid

## Integration with Existing Code

The JSON testing path is completely isolated and doesn't affect:

- Existing database repositories
- Production scheduling endpoints
- Database configuration
- Existing tests

It provides a parallel testing environment for development and validation purposes.
