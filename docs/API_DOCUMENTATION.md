# Teacher Scheduling Module — API Reference

THIS MODULE IS UNDER EXAM MODLE.

Base URL: `/api/exam/`

All endpoints (except where noted) require JWT auth header:

```
Authorization: Bearer <access_token>
```

All responses follow the standard format:

```json
{ "success": true/false, "data": ..., "message": "..." }
```

---

## 1. Teacher CRUD

### 1.1 List All Teachers

```
GET /api/exam/teachers/
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "TE-ABC123",
      "name": "John Doe",
      "phone_number": "+260991234567",
      "email": "john@sti.edu",
      "subject_ids": [],
      "subjects_display": [],
      "created_at": "2026-05-23T10:00:00Z",
      "updated_at": "2026-05-23T10:00:00Z"
    }
  ]
}
```

### 1.2 Create Teacher

```
POST /api/exam/teachers/
```

**Payload:**

```json
{
  "name": "John Doe",
  "phone_number": "+260991234567",
  "email": "john@sti.edu",
  "subject_ids": ["SU-XXXXX", "SU-YYYYY"]
}
```

| Field          | Type     | Required | Description                                 |
| -------------- | -------- | -------- | ------------------------------------------- |
| `name`         | string   | yes      | Teacher's full name                         |
| `phone_number` | string   | yes      | Contact number                              |
| `email`        | string   | no       | Email address                               |
| `subject_ids`  | string[] | no       | Array of Subject PKs this teacher can teach |

**Response** (201):

```json
{
  "success": true,
  "data": {
    "id": "TE-ABC123",
    "name": "John Doe",
    "phone_number": "+260991234567",
    "email": "john@sti.edu",
    "subject_ids": ["SU-XXXXX"],
    "subjects_display": [
      { "id": "SU-XXXXX", "code": "CF", "name": "Computer Fundamental" }
    ]
  },
  "message": "Teacher created."
}
```

### 1.3 Get Single Teacher

```
GET /api/exam/teachers/<teacher_id>
```

### 1.4 Update Teacher

```
PUT /api/exam/teachers/<teacher_id>
```

**Payload** (same as create):

```json
{
  "name": "John Updated",
  "phone_number": "+260991234567",
  "email": "john@sti.edu",
  "subject_ids": ["SU-XXXXX", "SU-ZZZZZ"]
}
```

**Note:** This **replaces** the subject list entirely. Send all subjects the teacher should teach.

### 1.5 Delete Teacher

```
DELETE /api/exam/teachers/<teacher_id>
```

**Response:**

```json
{
  "success": true,
  "message": "Teacher deleted."
}
```

---

## 2. Teacher Availability

Each teacher has 15 weekly time slots (5 days × 3 slots). Set which slots they are available.

### 2.1 Get Availability

```
GET /api/exam/teachers/<teacher_id>/availability/
```

**Response:**

```json
{
  "success": true,
  "data": [
    { "id": "TA-xxx", "teacher": "TE-ABC123", "day_of_week": 1, "slot": "9-11", "is_available": true },
    { "id": "TA-xxx", "teacher": "TE-ABC123", "day_of_week": 1, "slot": "12-2", "is_available": true },
    { "id": "TA-xxx", "teacher": "TE-ABC123", "day_of_week": 1, "slot": "2-4", "is_available": false },
    ...
  ]
}
```

**Slot values:**

| Slot   | Time               |
| ------ | ------------------ |
| `9-11` | 9:00 AM - 11:00 AM |
| `12-2` | 12:00 PM - 2:00 PM |
| `2-4`  | 2:00 PM - 4:00 PM  |

**Day values:**

| Value | Day       |
| ----- | --------- |
| 1     | Monday    |
| 2     | Tuesday   |
| 3     | Wednesday |
| 4     | Thursday  |
| 5     | Friday    |

### 2.2 Set Availability (Batch)

```
POST /api/exam/teachers/<teacher_id>/availability/
```

This **replaces** all availability slots for the teacher. Send all 15 rows.

**Payload:**

```json
{
  "availabilities": [
    { "teacher": "TE-ABC123", "day_of_week": 1, "slot": "9-11", "is_available": true },
    { "teacher": "TE-ABC123", "day_of_week": 1, "slot": "12-2", "is_available": true },
    { "teacher": "TE-ABC123", "day_of_week": 1, "slot": "2-4", "is_available": false },
    { "teacher": "TE-ABC123", "day_of_week": 2, "slot": "9-11", "is_available": true },
    ... (all 15 slots)
  ]
}
```

| Field          | Type   | Required | Description                     |
| -------------- | ------ | -------- | ------------------------------- |
| `teacher`      | string | yes      | Teacher PK (must match the URL) |
| `day_of_week`  | int    | yes      | 1-5 (Mon-Fri)                   |
| `slot`         | string | yes      | One of: `9-11`, `12-2`, `2-4`   |
| `is_available` | bool   | no       | Defaults to `true`              |

---

## 3. Subject Frequencies

Set how many classes per week each subject gets for a specific intake+semester.

### 3.1 Get Frequencies

```
GET /api/exam/intakes/<intake_id>/semesters/<semester_id>/subject-frequencies/
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "ISF-xxx",
      "intake": "INT-xxx",
      "semester": "SEM-xxx",
      "subject": "SU-XXXXX",
      "subject_code": "CF",
      "subject_name": "Computer Fundamental",
      "frequency": 3
    }
  ]
}
```

### 3.2 Set Frequency (Single or Bulk)

```
POST /api/exam/intakes/<intake_id>/semesters/<semester_id>/subject-frequencies/
```

Accepts a **single object** or an **array of objects**.

**Single:**

```json
{
  "subject": "SU-XXXXX",
  "frequency": 3
}
```

**Bulk (array):**

```json
[
  { "subject": "SU-XXXXX", "frequency": 3 },
  { "subject": "SU-YYYYY", "frequency": 2 },
  { "subject": "SU-ZZZZZ", "frequency": 4 }
]
```

| Field       | Type    | Required | Description                       |
| ----------- | ------- | -------- | --------------------------------- |
| `subject`   | string  | yes      | Subject PK                        |
| `frequency` | integer | yes      | Number of classes per week (1-15) |

**Note:** The sum of all frequencies **must not exceed 15** (total weekly slots).

### 3.3 Delete Frequency(s)

```
DELETE /api/exam/intakes/<intake_id>/semesters/<semester_id>/subject-frequencies/?subject=SU-XXXXX
```

| Query Param | Description                                                                                               |
| ----------- | --------------------------------------------------------------------------------------------------------- |
| `subject`   | (optional) Delete only this subject's frequency. Omit to delete ALL frequencies for this intake+semester. |

---

## 4. Timetable Generation

### 4.1 Generate Timetable

```
POST /api/exam/intakes/<intake_id>/semesters/<semester_id>/timetable/generate/
```

**No request body needed.**

The algorithm:

1. Reads all `IntakeSubjectFrequency` records for the intake+semester
2. Reads all teachers and their linked subjects
3. Reads all teacher availability slots
4. Creates 15 weekly slots (Mon-Fri × 3 slots)
5. Assigns subjects in order of highest frequency first
6. For each slot, picks an available teacher who teaches that subject
7. If no available teacher, assigns one with a **warning**

**Response:**

```json
{
  "success": true,
  "data": {
    "intake": "INT-xxx",
    "semester": "SEM-xxx",
    "timetable": [
      {
        "day": 1,
        "day_label": "Monday",
        "slots": [
          { "slot": "9-11", "subject_code": "CF", "subject_name": "Computer Fundamental", "teacher_name": "John Doe" },
          { "slot": "12-2", "subject_code": "P01", "subject_name": "Programming C", "teacher_name": "Jane Smith" },
          { "slot": "2-4", "subject_code": null, "subject_name": null, "teacher_name": null }
        ]
      },
      { "day": 2, "day_label": "Tuesday", "slots": [ ... ] },
      { "day": 3, "day_label": "Wednesday", "slots": [ ... ] },
      { "day": 4, "day_label": "Thursday", "slots": [ ... ] },
      { "day": 5, "day_label": "Friday", "slots": [ ... ] }
    ],
    "warnings": [
      "Subject 'P01' only got 2/3 weekly classes.",
      "Teacher 'John Doe' may be double-booked for CF on Monday 9-11."
    ]
  },
  "message": "Timetable generated."
}
```

| Field in response               | Description                                         |
| ------------------------------- | --------------------------------------------------- |
| `timetable`                     | Array of 5 days, each with 3 slots                  |
| `warnings`                      | Array of warning strings for unresolvable conflicts |
| `subject_code` / `subject_name` | `null` if slot is empty                             |
| `teacher_name`                  | `null` if slot is empty                             |

### 4.2 View Timetable

```
GET /api/exam/intakes/<intake_id>/semesters/<semester_id>/timetable/
```

**Response** (same structure as generate, without warnings):

```json
{
  "success": true,
  "data": {
    "intake": "INT-xxx",
    "semester": "SEM-xxx",
    "timetable": [ ... ]
  }
}
```

### 4.3 Update Single Slot (Manual Fix)

```
PUT /api/exam/intakes/<intake_id>/semesters/<semester_id>/timetable/
```

**Payload:**

```json
{
  "day_of_week": 1,
  "slot": "2-4",
  "subject": "SU-XXXXX",
  "teacher": "TE-ABC123"
}
```

| Field         | Type   | Required | Description              |
| ------------- | ------ | -------- | ------------------------ |
| `day_of_week` | int    | yes      | 1-5                      |
| `slot`        | string | yes      | `9-11`, `12-2`, or `2-4` |
| `subject`     | string | yes      | Subject PK               |
| `teacher`     | string | yes      | Teacher PK               |

This creates or updates the specific slot. Use this to manually fix warnings.

### 4.4 Clear Timetable

```
DELETE /api/exam/intakes/<intake_id>/semesters/<semester_id>/timetable/
```

**Response:**

```json
{
  "success": true,
  "message": "Timetable cleared."
}
```

Allows regeneration from scratch.

---

## 5. Workflow Summary

### Setup Phase (once per system)

1. **Create teachers** → `POST /api/exam/teachers/` with `subject_ids`
2. **Set teacher availability** → `POST /api/exam/teachers/<id>/availability/` (15 slots)

### Per Intake+Semester

3. **Set frequencies** → `POST /api/exam/intakes/<id>/semesters/<id>/subject-frequencies/`
4. **Generate timetable** → `POST /api/exam/intakes/<id>/semesters/<id>/timetable/generate/`
5. **Review warnings** → Inspect `warnings[]` in the response
6. **Manual fix** → `PUT /api/exam/intakes/<id>/semesters/<id>/timetable/` for each slot that needs correction
7. **View final** → `GET /api/exam/intakes/<id>/semesters/<id>/timetable/`
