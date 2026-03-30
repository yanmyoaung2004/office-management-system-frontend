# School Office Management System - API Documentation

## Base URL

```
http://localhost:3000/api
```

---

## Table of Contents

1. [Authentication](#authentication)
2. [Users](#users)
3. [Students](#students)
4. [Majors](#majors)
5. [Intakes](#intakes)
6. [Enquiries](#enquiries)
7. [Follow-up Sessions](#follow-up-sessions)
8. [Daily Reports](#daily-reports)
9. [Dropouts](#dropouts)
10. [Error Handling](#error-handling)

---

## Authentication

### Login

**POST** `/auth/login`

**Description:** Authenticate user with credentials

**Request Body:**

```json
{
  "username": "string (required)",
  "password": "string (required)"
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "U001",
    "username": "admin",
    "fullName": "Ma Thidar",
    "email": "thidar@stimy.edu.mm",
    "role": "admin",
    "token": "jwt_token_here"
  }
}
```

**Response (401):**

```json
{
  "success": false,
  "error": "Invalid username or password"
}
```

---

### Logout

**POST** `/auth/logout`

**Description:** Logout user (invalidate token)

**Headers:**

```
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## Users

### Get All Users

**GET** `/users?page=1&limit=10`

**Description:** Retrieve all users with pagination

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | integer | No | Page number (default: 1) |
| limit | integer | No | Items per page (default: 10) |
| role | string | No | Filter by role (admin/staff) |

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "U001",
      "username": "admin",
      "fullName": "Ma Thidar",
      "email": "thidar@stimy.edu.mm",
      "role": "admin"
    },
    {
      "id": "U002",
      "username": "staff",
      "fullName": "U Min Thu",
      "email": "minthuu@stimy.edu.mm",
      "role": "staff"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 2,
    "totalPages": 1
  }
}
```

---

### Get User By ID

**GET** `/users/:id`

**Description:** Retrieve specific user details

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | User ID (e.g., U001) |

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "U001",
    "username": "admin",
    "fullName": "Ma Thidar",
    "email": "thidar@stimy.edu.mm",
    "role": "admin",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

**Response (404):**

```json
{
  "success": false,
  "error": "User not found"
}
```

---

### Create User

**POST** `/users`

**Description:** Create a new user (Admin only)

**Headers:**

```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "username": "string (required, unique)",
  "password": "string (required, min 6 chars)",
  "fullName": "string (required)",
  "email": "string (required, valid email)",
  "role": "string (required, enum: admin/staff)"
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": "U003",
    "username": "newstaff",
    "fullName": "Kyaw Soe",
    "email": "kyawsoe@stimy.edu.mm",
    "role": "staff",
    "createdAt": "2024-11-15T14:20:00Z"
  }
}
```

**Response (400):**

```json
{
  "success": false,
  "error": "Username already exists"
}
```

---

### Update User

**PUT** `/users/:id`

**Description:** Update user details (Admin only or own profile)

**Path Parameters:**
| Parameter | Type | Required |
|-----------|------|----------|
| id | string | Yes |

**Request Body:**

```json
{
  "fullName": "string (optional)",
  "email": "string (optional)",
  "password": "string (optional)"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": "U001",
    "username": "admin",
    "fullName": "Ma Thidar Win",
    "email": "thidar.win@stimy.edu.mm",
    "role": "admin",
    "updatedAt": "2024-11-15T14:25:00Z"
  }
}
```

---

### Delete User

**DELETE** `/users/:id`

**Description:** Delete user (Admin only)

**Path Parameters:**
| Parameter | Type | Required |
|-----------|------|----------|
| id | string | Yes |

**Response (200):**

```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

**Response (403):**

```json
{
  "success": false,
  "error": "Cannot delete the last admin user"
}
```

---

## Students

### Get All Students

**GET** `/students?page=1&limit=10&major=&intake=&status=&educationLevel=&gender=`

**Description:** Retrieve all students with filters and pagination

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | integer | No | Page number (default: 1) |
| limit | integer | No | Items per page (default: 10) |
| major | string | No | Filter by major ID |
| intake | string | No | Filter by intake ID |
| status | string | No | Filter by status (Enrolled/Dropout/Graduated) |
| educationLevel | string | No | Filter by education level |
| gender | string | No | Filter by gender (Male/Female/Other) |
| scholar | boolean | No | Filter by scholar status |
| search | string | No | Search by name, NRC, email, phone |

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "STU001",
      "no": 1,
      "fullName": "Aung Kyaw",
      "educationLevel": "Tertiary",
      "programDuration": "8 Months",
      "gender": "Male",
      "nrc": "12/ABCDE(N)123456",
      "birthDate": "1998-05-15",
      "age": 26,
      "program": "Computer Science",
      "studentPhoneNo": "+260-96-555-1001",
      "parentName": "U Ko Win",
      "parentPhoneNo": "+260-96-555-1002",
      "email": "aungkyaw@example.com",
      "scholar": false,
      "promotion": "Not Applicable",
      "totalSchoolFee": 500000,
      "enrolledDate": "2024-09-01",
      "nrcCopy": true,
      "censusCopy": true,
      "passportPhoto": true,
      "educationCertificate": false,
      "referralName": "Ma Soe",
      "birthMonth": 5,
      "remark": "Excellent student",
      "majorId": "MAJ001",
      "intakeId": "INT001",
      "status": "Enrolled",
      "currentSemester": 1,
      "academicYear": 1,
      "createdAt": "2024-09-01T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

---

### Get Student By ID

**GET** `/students/:id`

**Description:** Retrieve specific student details

**Path Parameters:**
| Parameter | Type | Required |
|-----------|------|----------|
| id | string | Yes |

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "STU001",
    "no": 1,
    "fullName": "Aung Kyaw",
    "educationLevel": "Tertiary",
    "programDuration": "8 Months",
    "gender": "Male",
    "nrc": "12/ABCDE(N)123456",
    "birthDate": "1998-05-15",
    "age": 26,
    "program": "Computer Science",
    "studentPhoneNo": "+260-96-555-1001",
    "parentName": "U Ko Win",
    "parentPhoneNo": "+260-96-555-1002",
    "email": "aungkyaw@example.com",
    "scholar": false,
    "promotion": "Not Applicable",
    "totalSchoolFee": 500000,
    "enrolledDate": "2024-09-01",
    "nrcCopy": true,
    "censusCopy": true,
    "passportPhoto": true,
    "educationCertificate": false,
    "referralName": "Ma Soe",
    "birthMonth": 5,
    "remark": "Excellent student",
    "majorId": "MAJ001",
    "intakeId": "INT001",
    "status": "Enrolled",
    "currentSemester": 1,
    "academicYear": 1,
    "createdAt": "2024-09-01T10:00:00Z",
    "updatedAt": "2024-11-10T14:30:00Z"
  }
}
```

---

### Create Student

**POST** `/students`

**Description:** Create a new student record

**Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "no": 1,
  "fullName": "string (required)",
  "educationLevel": "string (required, enum: Primary/Secondary/Tertiary/Other)",
  "programDuration": "string (required, enum: 4 Months/8 Months)",
  "gender": "string (required, enum: Male/Female/Other)",
  "nrc": "string (required)",
  "birthDate": "string (required, YYYY-MM-DD)",
  "age": "integer (optional, auto-calculated)",
  "program": "string (required)",
  "studentPhoneNo": "string (required)",
  "parentName": "string (required)",
  "parentPhoneNo": "string (required)",
  "email": "string (required, valid email)",
  "scholar": "boolean (default: false)",
  "totalSchoolFee": "number (required)",
  "enrolledDate": "string (required, YYYY-MM-DD)",
  "nrcCopy": "boolean (default: false)",
  "censusCopy": "boolean (default: false)",
  "passportPhoto": "boolean (default: false)",
  "educationCertificate": "boolean (default: false)",
  "referralName": "string (optional)",
  "birthMonth": "integer (optional, 1-12)",
  "remark": "string (optional)",
  "majorId": "string (required)",
  "intakeId": "string (required)"
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "Student created successfully",
  "data": {
    "id": "STU002",
    "no": 2,
    "fullName": "May Zaw",
    "createdAt": "2024-11-15T10:00:00Z"
  }
}
```

---

### Update Student

**PUT** `/students/:id`

**Description:** Update student details

**Path Parameters:**
| Parameter | Type | Required |
|-----------|------|----------|
| id | string | Yes |

**Request Body:**

```json
{
  "fullName": "string (optional)",
  "email": "string (optional)",
  "studentPhoneNo": "string (optional)",
  "parentPhoneNo": "string (optional)",
  "nrcCopy": "boolean (optional)",
  "censusCopy": "boolean (optional)",
  "passportPhoto": "boolean (optional)",
  "educationCertificate": "boolean (optional)",
  "remark": "string (optional)",
  "scholar": "boolean (optional)"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Student updated successfully",
  "data": {
    "id": "STU001",
    "fullName": "Aung Kyaw",
    "updatedAt": "2024-11-15T14:30:00Z"
  }
}
```

---

### Delete Student

**DELETE** `/students/:id`

**Description:** Delete student record

**Path Parameters:**
| Parameter | Type | Required |
|-----------|------|----------|
| id | string | Yes |

**Response (200):**

```json
{
  "success": true,
  "message": "Student deleted successfully"
}
```

---

### Promote Student

**POST** `/students/:id/promote`

**Description:** Promote student to next semester

**Path Parameters:**
| Parameter | Type | Required |
|-----------|------|----------|
| id | string | Yes |

**Request Body:**

```json
{
  "promotion": "string (e.g., 'Promoted to Semester 2')"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Student promoted successfully",
  "data": {
    "id": "STU001",
    "currentSemester": 2,
    "promotion": "Promoted to Semester 2",
    "updatedAt": "2024-11-15T15:00:00Z"
  }
}
```

---

## Majors

### Get All Majors

**GET** `/majors?page=1&limit=10`

**Description:** Retrieve all majors/programs

**Query Parameters:**
| Parameter | Type | Required |
|-----------|------|----------|
| page | integer | No |
| limit | integer | No |

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "MAJ001",
      "name": "Computer Science",
      "code": "CS",
      "description": "Information Technology and Software Development"
    },
    {
      "id": "MAJ002",
      "name": "Public Health",
      "code": "PH",
      "description": "Health Science and Community Health"
    },
    {
      "id": "MAJ003",
      "name": "Business",
      "code": "BE",
      "description": "Business Administration and Management"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 3,
    "totalPages": 1
  }
}
```

---

### Get Major By ID

**GET** `/majors/:id`

**Path Parameters:**
| Parameter | Type | Required |
|-----------|------|----------|
| id | string | Yes |

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "MAJ001",
    "name": "Computer Science",
    "code": "CS",
    "description": "Information Technology and Software Development",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

---

### Create Major

**POST** `/majors`

**Description:** Create new major (Admin only)

**Headers:**

```
Authorization: Bearer <admin_token>
```

**Request Body:**

```json
{
  "name": "string (required, unique)",
  "code": "string (required, unique, 2-3 chars)",
  "description": "string (optional)"
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "Major created successfully",
  "data": {
    "id": "MAJ004",
    "name": "Engineering",
    "code": "ENG",
    "description": "Software and Civil Engineering",
    "createdAt": "2024-11-15T10:00:00Z"
  }
}
```

---

### Update Major

**PUT** `/majors/:id`

**Request Body:**

```json
{
  "name": "string (optional)",
  "description": "string (optional)"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Major updated successfully"
}
```

---

### Delete Major

**DELETE** `/majors/:id`

**Response (200):**

```json
{
  "success": true,
  "message": "Major deleted successfully"
}
```

---

## Intakes

### Get All Intakes

**GET** `/intakes?page=1&limit=10&major=`

**Description:** Retrieve all intakes with pagination

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | integer | No | Page number |
| limit | integer | No | Items per page |
| major | string | No | Filter by major ID |

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "INT001",
      "code": "2024-01",
      "majorId": "MAJ001",
      "majorName": "Computer Science",
      "year": 2024,
      "startDate": "2024-01-15",
      "endDate": "2024-09-15",
      "capacity": 50,
      "currentEnrollment": 45,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 4,
    "totalPages": 1
  }
}
```

---

### Get Intake By ID

**GET** `/intakes/:id`

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "INT001",
    "code": "2024-01",
    "majorId": "MAJ001",
    "majorName": "Computer Science",
    "year": 2024,
    "startDate": "2024-01-15",
    "endDate": "2024-09-15",
    "capacity": 50,
    "currentEnrollment": 45,
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

---

### Create Intake

**POST** `/intakes`

**Description:** Create new intake (Admin only)

**Request Body:**

```json
{
  "code": "string (required, format: YYYY-MM)",
  "majorId": "string (required)",
  "year": "integer (required)",
  "startDate": "string (required, YYYY-MM-DD)",
  "endDate": "string (required, YYYY-MM-DD)",
  "capacity": "integer (required)"
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "Intake created successfully",
  "data": {
    "id": "INT005",
    "code": "2024-09",
    "majorId": "MAJ001",
    "year": 2024,
    "createdAt": "2024-11-15T10:00:00Z"
  }
}
```

---

### Update Intake

**PUT** `/intakes/:id`

**Request Body:**

```json
{
  "code": "string (optional)",
  "startDate": "string (optional, YYYY-MM-DD)",
  "endDate": "string (optional, YYYY-MM-DD)",
  "capacity": "integer (optional)"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Intake updated successfully"
}
```

---

### Delete Intake

**DELETE** `/intakes/:id`

**Response (200):**

```json
{
  "success": true,
  "message": "Intake deleted successfully"
}
```

---

## Enquiries

### Get All Enquiries

**GET** `/enquiries?page=1&limit=8&search=&enquiryType=&source=`

**Description:** Retrieve all student enquiries with filters

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | integer | No | Page number |
| limit | integer | No | Items per page |
| search | string | No | Search by name, program, phone |
| enquiryType | string | No | Filter by type (Enquiry/Walk-in/Phone/Facebook) |
| source | string | No | Filter by source (Friend/Facebook/Pamphlet/Newspaper/Others) |

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "ENQ001",
      "date": "2024-10-15",
      "desiredProgram": "Computer Science",
      "studentName": "Aung Kyaw",
      "educationLevel": "Tertiary",
      "studentContactNo": "+260-96-555-1001",
      "parentName": "U Ko Win",
      "parentContactNo": "+260-96-555-1002",
      "address": "123 Yangon Street, Yangon",
      "enquiryType": "Walk-in",
      "sourceOfInformation": "Friend",
      "remark": "Promising candidate",
      "followUpCount": 2,
      "createdAt": "2024-10-15T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 8,
    "total": 5,
    "totalPages": 1
  }
}
```

---

### Get Enquiry By ID

**GET** `/enquiries/:id`

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "ENQ001",
    "date": "2024-10-15",
    "desiredProgram": "Computer Science",
    "studentName": "Aung Kyaw",
    "educationLevel": "Tertiary",
    "studentContactNo": "+260-96-555-1001",
    "parentName": "U Ko Win",
    "parentContactNo": "+260-96-555-1002",
    "address": "123 Yangon Street, Yangon",
    "enquiryType": "Walk-in",
    "sourceOfInformation": "Friend",
    "remark": "Promising candidate",
    "followUpSessions": [
      {
        "id": "FUP001",
        "date": "2024-10-22",
        "handledBy": "Ma Thidar",
        "walkupFollowup": true,
        "remark": "Student interested, shared program details"
      }
    ],
    "createdAt": "2024-10-15T10:00:00Z",
    "updatedAt": "2024-11-10T14:30:00Z"
  }
}
```

---

### Create Enquiry

**POST** `/enquiries`

**Description:** Create new student enquiry

**Request Body:**

```json
{
  "date": "string (required, YYYY-MM-DD)",
  "desiredProgram": "string (required)",
  "studentName": "string (required)",
  "educationLevel": "string (required, enum: Primary/Secondary/Tertiary/Other)",
  "studentContactNo": "string (required)",
  "parentName": "string (required)",
  "parentContactNo": "string (required)",
  "address": "string (required)",
  "enquiryType": "string (required, enum: Enquiry/Walk-in/Phone/Facebook)",
  "sourceOfInformation": "string (required, enum: Friend/Facebook/Pamphlet/Newspaper/Others)",
  "remark": "string (optional)"
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "Enquiry created successfully",
  "data": {
    "id": "ENQ006",
    "studentName": "Htin Kyaw",
    "desiredProgram": "Business",
    "enquiryType": "Enquiry",
    "createdAt": "2024-11-15T10:00:00Z"
  }
}
```

---

### Update Enquiry

**PUT** `/enquiries/:id`

**Request Body:**

```json
{
  "desiredProgram": "string (optional)",
  "studentContactNo": "string (optional)",
  "parentContactNo": "string (optional)",
  "address": "string (optional)",
  "remark": "string (optional)"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Enquiry updated successfully"
}
```

---

### Delete Enquiry

**DELETE** `/enquiries/:id`

**Response (200):**

```json
{
  "success": true,
  "message": "Enquiry deleted successfully"
}
```

---

## Follow-up Sessions

### Get Follow-ups for Enquiry

**GET** `/enquiries/:enquiryId/followups?page=1&limit=10`

**Description:** Retrieve all follow-ups for a specific enquiry

**Path Parameters:**
| Parameter | Type | Required |
|-----------|------|----------|
| enquiryId | string | Yes |

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "FUP001",
      "enquiryId": "ENQ001",
      "date": "2024-10-22",
      "handledBy": "Ma Thidar",
      "walkupFollowup": true,
      "remark": "Student interested, shared program details",
      "createdAt": "2024-10-22T11:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 2,
    "totalPages": 1
  }
}
```

---

### Get Follow-up By ID

**GET** `/followups/:id`

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "FUP001",
    "enquiryId": "ENQ001",
    "date": "2024-10-22",
    "handledBy": "Ma Thidar",
    "walkupFollowup": true,
    "remark": "Student interested, shared program details",
    "createdAt": "2024-10-22T11:00:00Z",
    "updatedAt": "2024-10-22T11:00:00Z"
  }
}
```

---

### Create Follow-up Session

**POST** `/enquiries/:enquiryId/followups`

**Description:** Add follow-up session to enquiry

**Request Body:**

```json
{
  "date": "string (required, YYYY-MM-DD)",
  "handledBy": "string (required, staff member name)",
  "walkupFollowup": "boolean (default: false)",
  "remark": "string (required)"
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "Follow-up session created successfully",
  "data": {
    "id": "FUP006",
    "enquiryId": "ENQ005",
    "date": "2024-11-15",
    "handledBy": "U Min Thu",
    "createdAt": "2024-11-15T11:00:00Z"
  }
}
```

---

### Update Follow-up

**PUT** `/followups/:id`

**Request Body:**

```json
{
  "date": "string (optional, YYYY-MM-DD)",
  "handledBy": "string (optional)",
  "walkupFollowup": "boolean (optional)",
  "remark": "string (optional)"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Follow-up updated successfully"
}
```

---

### Delete Follow-up

**DELETE** `/followups/:id`

**Response (200):**

```json
{
  "success": true,
  "message": "Follow-up deleted successfully"
}
```

---

## Daily Reports

### Get All Reports

**GET** `/reports?page=1&limit=5&userId=&date=&search=`

**Description:** Retrieve all daily reports with filters

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | integer | No | Page number |
| limit | integer | No | Items per page |
| userId | string | No | Filter by user ID |
| date | string | No | Filter by date (YYYY-MM-DD) |
| search | string | No | Search in activities text |

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "R001",
      "userId": "U002",
      "userName": "U Min Thu",
      "date": "2024-11-10",
      "activities": "Handled 3 student inquiries about Computer Science program...",
      "enquiryCount": 2,
      "createdAt": "2024-11-10T17:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 5,
    "total": 3,
    "totalPages": 1
  }
}
```

---

### Get Report By ID

**GET** `/reports/:id`

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "R001",
    "userId": "U002",
    "userName": "U Min Thu",
    "date": "2024-11-10",
    "activities": "Handled 3 student inquiries about Computer Science program. Conducted follow-up calls with 2 previous inquiries. Updated enrollment records for new student.",
    "enquiriesHandled": [
      {
        "enquiryId": "ENQ001",
        "studentName": "Aung Kyaw",
        "action": "Follow-up conducted"
      },
      {
        "enquiryId": "ENQ003",
        "studentName": "Htin Kyaw",
        "action": "Enrollment processed"
      }
    ],
    "createdAt": "2024-11-10T17:30:00Z",
    "updatedAt": "2024-11-10T17:30:00Z"
  }
}
```

---

### Create Daily Report

**POST** `/reports`

**Description:** Submit daily activity report

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "userId": "string (required)",
  "date": "string (required, YYYY-MM-DD)",
  "activities": "string (required, min 10 chars)",
  "enquiriesHandled": [
    {
      "enquiryId": "string (required)",
      "action": "string (required)"
    }
  ]
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "Report submitted successfully",
  "data": {
    "id": "R004",
    "userId": "U002",
    "date": "2024-11-15",
    "enquiryCount": 2,
    "createdAt": "2024-11-15T18:00:00Z"
  }
}
```

**Response (400):**

```json
{
  "success": false,
  "error": "Report for this user and date already exists"
}
```

---

### Update Report

**PUT** `/reports/:id`

**Request Body:**

```json
{
  "activities": "string (optional)",
  "enquiriesHandled": "array (optional)"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Report updated successfully"
}
```

---

### Delete Report

**DELETE** `/reports/:id`

**Response (200):**

```json
{
  "success": true,
  "message": "Report deleted successfully"
}
```

---

### Get Report Statistics

**GET** `/reports/stats?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&userId=`

**Description:** Get report statistics for date range

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| startDate | string | No | Start date (YYYY-MM-DD) |
| endDate | string | No | End date (YYYY-MM-DD) |
| userId | string | No | Filter by user ID |

**Response (200):**

```json
{
  "success": true,
  "data": {
    "totalReports": 3,
    "averageReportsPerDay": 1.5,
    "mostActiveUser": "U Min Thu",
    "mostHandledEnquiries": "ENQ001",
    "dateRange": {
      "start": "2024-11-09",
      "end": "2024-11-10"
    }
  }
}
```

---

## Dropouts

### Get All Dropouts

**GET** `/dropouts?page=1&limit=10&student=&reason=`

**Description:** Retrieve all student dropouts

**Query Parameters:**
| Parameter | Type | Required |
|-----------|------|----------|
| page | integer | No |
| limit | integer | No |
| student | string | No |
| reason | string | No |

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "DO001",
      "studentId": "STU005",
      "studentName": "Kyaw Soe",
      "intakeId": "INT001",
      "dropoutDate": "2024-11-05",
      "reason": "Financial constraints",
      "remark": "Student unable to afford fees",
      "createdAt": "2024-11-05T14:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

---

### Create Dropout Record

**POST** `/dropouts`

**Description:** Mark student as dropout

**Request Body:**

```json
{
  "studentId": "string (required)",
  "dropoutDate": "string (required, YYYY-MM-DD)",
  "reason": "string (required)",
  "remark": "string (optional)"
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "Student marked as dropout",
  "data": {
    "id": "DO002",
    "studentId": "STU006",
    "dropoutDate": "2024-11-15",
    "createdAt": "2024-11-15T15:00:00Z"
  }
}
```

---

### Delete Dropout Record

**DELETE** `/dropouts/:id`

**Response (200):**

```json
{
  "success": true,
  "message": "Dropout record deleted"
}
```

---

## Error Handling

### Standard Error Response

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

### Common Error Codes

| Code             | HTTP Status | Description                              |
| ---------------- | ----------- | ---------------------------------------- |
| UNAUTHORIZED     | 401         | Missing or invalid authentication token  |
| FORBIDDEN        | 403         | Insufficient permissions for this action |
| NOT_FOUND        | 404         | Resource not found                       |
| BAD_REQUEST      | 400         | Invalid request parameters               |
| CONFLICT         | 409         | Resource already exists                  |
| INTERNAL_ERROR   | 500         | Server error                             |
| VALIDATION_ERROR | 422         | Validation error in request body         |

### Error Response Examples

**401 Unauthorized:**

```json
{
  "success": false,
  "error": "No authentication token provided",
  "code": "UNAUTHORIZED"
}
```

**403 Forbidden:**

```json
{
  "success": false,
  "error": "You do not have permission to perform this action",
  "code": "FORBIDDEN"
}
```

**422 Validation Error:**

```json
{
  "success": false,
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

---

## Authentication Headers

All protected endpoints require:

```
Authorization: Bearer <jwt_token>
```

---

## Rate Limiting

- Rate limit: 100 requests per minute per IP
- Rate limit: 1000 requests per hour per user

---

## Pagination

All list endpoints support pagination with:

- `page`: Current page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)
- Response includes: `total`, `totalPages`, `page`, `limit`

---

## Status Codes Summary

- `200 OK`: Successful GET/PUT/DELETE
- `201 Created`: Successful POST
- `400 Bad Request`: Invalid parameters
- `401 Unauthorized`: Missing/invalid token
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource already exists
- `422 Unprocessable Entity`: Validation error
- `500 Internal Server Error`: Server error
