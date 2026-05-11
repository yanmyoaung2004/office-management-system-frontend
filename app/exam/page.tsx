"use client";

import BetterTimetable from "../time-table";
export default function FinancePage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Exam Department</h1>
      {/* {user ? (
        <p>Welcome, {user.fullName}! This is the exam department page.</p>
      ) : (
        <p>Loading...</p>
      )} */}
      <BetterTimetable />
    </div>
  );
}
