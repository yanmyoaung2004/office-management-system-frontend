"use client";

import { useParams } from "next/navigation";
import { TeacherDetail } from "@/components/exam/teacher-detail";

export default function TeacherDetailPage() {
  const params = useParams();
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <TeacherDetail teacherId={params.id as string} />
    </main>
  );
}
