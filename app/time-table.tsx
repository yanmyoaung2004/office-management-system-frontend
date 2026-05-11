import React, { useState } from "react";

// --- TYPES ---
type Day = "Mon" | "Tue" | "Wed" | "Thu" | "Fri";
type Slot = "09:11" | "12:02" | "02:04";

interface Teacher {
  id: string;
  name: string;
  slots: Slot[];
  subs: string[];
}

interface SubjectRequirement {
  id: string;
  name: string;
  count: number;
}

interface TimetableEntry {
  day: Day;
  slot: Slot;
  sub: string;
  teacher: string;
}

const DAYS: Day[] = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const DEFAULT_SLOTS: Slot[] = ["09:11", "12:02", "02:04"];

const ProfessionalScheduler: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjectsNeeded, setSubjectsNeeded] = useState<SubjectRequirement[]>(
    [],
  );
  const [result, setResult] = useState<TimetableEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form States
  const [teacherName, setTeacherName] = useState("");
  const [teacherSlots, setTeacherSlots] = useState<Slot[]>([]);
  const [teacherSubs, setTeacherSubs] = useState("");
  const [subName, setSubName] = useState("");
  const [subCount, setSubCount] = useState(1);

  // --- VALIDATION LOGIC ---
  const validateData = (): string | null => {
    const totalSessionsRequested = subjectsNeeded.reduce(
      (sum, s) => sum + s.count,
      0,
    );
    const totalGridSlots = DAYS.length * DEFAULT_SLOTS.length;

    // 1. Capacity Check
    if (totalSessionsRequested > totalGridSlots) {
      return `Impossible: You requested ${totalSessionsRequested} sessions, but only ${totalGridSlots} slots exist in a 5-day week.`;
    }

    // 2. Subject-Teacher Capability Check
    for (const sub of subjectsNeeded) {
      const qualifiedTeachers = teachers.filter((t) =>
        t.subs.includes(sub.name),
      );
      const totalAvailableCapacity = qualifiedTeachers.reduce(
        (sum, t) => sum + t.slots.length,
        0,
      );

      // Note: This is a loose check, actual slot overlap is handled by the GA
      if (qualifiedTeachers.length === 0) {
        return `Impossible: No teacher is assigned to teach "${sub.name}".`;
      }
    }

    // 3. Slot Saturation Check (e.g., can't have 6 classes at 09:11 in a 5-day week)
    // This is implicitly handled by the GA, but we warn the user if they under-provide slots
    const totalTeacherSlots = teachers.reduce(
      (sum, t) => sum + t.slots.length,
      0,
    );
    if (totalTeacherSlots < totalSessionsRequested) {
      return `Impossible: Teachers only have ${totalTeacherSlots} combined available time slots, but you need ${totalSessionsRequested} sessions.`;
    }

    return null;
  };

  // --- GENETIC ENGINE ---
  const calculateFitness = (timetable: TimetableEntry[]): number => {
    let score = 1000;
    const counts: Record<string, number> = {};
    const tLoad: Record<string, number> = {};
    const daySubs: Record<string, string[]> = {};

    timetable.forEach((e) => {
      if (e.sub === "FREE") return;
      counts[e.sub] = (counts[e.sub] || 0) + 1;
      tLoad[e.teacher] = (tLoad[e.teacher] || 0) + 1;

      const tData = teachers.find((t) => t.name === e.teacher);
      // Heavy Penalty for wrong teacher/slot
      if (
        !tData ||
        !tData.subs.includes(e.sub) ||
        !tData.slots.includes(e.slot)
      ) {
        score -= 500;
      }

      if (!daySubs[e.day]) daySubs[e.day] = [];
      if (daySubs[e.day].includes(e.sub)) score -= 100;
      daySubs[e.day].push(e.sub);
    });

    subjectsNeeded.forEach((s) => {
      score -= Math.abs((counts[s.name] || 0) - s.count) * 200;
    });

    return score;
  };

  const runEvolution = () => {
    setError(null);
    const validationError = validateData();
    if (validationError) {
      setError(validationError);
      setResult(null);
      return;
    }

    // Initial Random Population
    let population = Array.from({ length: 100 }, () =>
      DAYS.flatMap((day) =>
        DEFAULT_SLOTS.map((slot) => {
          const sub =
            Math.random() > 0.4
              ? "FREE"
              : subjectsNeeded.length > 0
                ? subjectsNeeded[
                    Math.floor(Math.random() * subjectsNeeded.length)
                  ].name
                : "FREE";
          const teacherNames = teachers.map((t) => t.name);
          return {
            day,
            slot,
            sub,
            teacher:
              sub === "FREE" || teacherNames.length === 0
                ? "None"
                : teacherNames[Math.floor(Math.random() * teacherNames.length)],
          };
        }),
      ),
    );

    for (let gen = 0; gen < 500; gen++) {
      population.sort((a, b) => calculateFitness(b) - calculateFitness(a));
      if (calculateFitness(population[0]) >= 1000) break;

      const top = population.slice(0, 20);
      population = [
        ...top,
        ...Array.from({ length: 80 }, () => {
          const p1 = top[Math.floor(Math.random() * top.length)];
          const p2 = top[Math.floor(Math.random() * top.length)];
          const pivot = Math.floor(Math.random() * p1.length);
          const child = [...p1.slice(0, pivot), ...p2.slice(pivot)];

          // Mutation
          if (Math.random() < 0.1) {
            const idx = Math.floor(Math.random() * child.length);
            const sub =
              Math.random() > 0.3
                ? "FREE"
                : subjectsNeeded[
                    Math.floor(Math.random() * subjectsNeeded.length)
                  ].name;
            child[idx] = {
              ...child[idx],
              sub,
              teacher:
                sub === "FREE"
                  ? "None"
                  : teachers[Math.floor(Math.random() * teachers.length)].name,
            };
          }
          return child;
        }),
      ];
    }

    if (calculateFitness(population[0]) < 1000) {
      setError(
        "Could not find a perfect solution. Teachers may have conflicting availability.",
      );
    }
    setResult(population[0]);
  };

  return (
    <div
      style={{
        padding: "20px",
        fontFamily: "Arial, sans-serif",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      <h1>University Scheduler v2.0</h1>

      {error && (
        <div
          style={{
            background: "#ff7675",
            color: "white",
            padding: "15px",
            borderRadius: "8px",
            marginBottom: "20px",
          }}
        >
          ⚠️ {error}
        </div>
      )}

      <div style={{ display: "flex", gap: "20px" }}>
        {/* Teacher Section */}
        <div
          style={{
            flex: 1,
            background: "#f9f9f9",
            padding: "20px",
            borderRadius: "10px",
          }}
        >
          <h2>Teachers</h2>
          <input
            placeholder="Name"
            value={teacherName}
            onChange={(e) => setTeacherName(e.target.value)}
            style={inputStyle}
          />
          <input
            placeholder="Subs (Comma separated)"
            value={teacherSubs}
            onChange={(e) => setTeacherSubs(e.target.value)}
            style={inputStyle}
          />
          <div>
            {DEFAULT_SLOTS.map((s) => (
              <label key={s} style={{ marginRight: "10px" }}>
                <input
                  type="checkbox"
                  checked={teacherSlots.includes(s)}
                  onChange={(e) =>
                    e.target.checked
                      ? setTeacherSlots([...teacherSlots, s])
                      : setTeacherSlots(teacherSlots.filter((x) => x !== s))
                  }
                />{" "}
                {s}
              </label>
            ))}
          </div>
          <button
            onClick={() => {
              setTeachers([
                ...teachers,
                {
                  id: Date.now().toString(),
                  name: teacherName,
                  slots: teacherSlots,
                  subs: teacherSubs.split(",").map((s) => s.trim()),
                },
              ]);
              setTeacherName("");
              setTeacherSlots([]);
              setTeacherSubs("");
            }}
            style={buttonStyle}
          >
            Add Teacher
          </button>

          <div style={{ marginTop: "20px" }}>
            {teachers.map((t) => (
              <div key={t.id} style={itemCard}>
                {t.name} ({t.subs.join(", ")})
                <button
                  onClick={() =>
                    setTeachers(teachers.filter((x) => x.id !== t.id))
                  }
                  style={delStyle}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Subjects Section */}
        <div
          style={{
            flex: 1,
            background: "#f9f9f9",
            padding: "20px",
            borderRadius: "10px",
          }}
        >
          <h2>Curriculum</h2>
          <input
            placeholder="Subject Name"
            value={subName}
            onChange={(e) => setSubName(e.target.value)}
            style={inputStyle}
          />
          <input
            type="number"
            value={subCount}
            onChange={(e) => setSubCount(Number(e.target.value))}
            style={inputStyle}
          />
          <button
            onClick={() => {
              setSubjectsNeeded([
                ...subjectsNeeded,
                { id: Date.now().toString(), name: subName, count: subCount },
              ]);
              setSubName("");
              setSubCount(1);
            }}
            style={{ ...buttonStyle, background: "#e67e22" }}
          >
            Add Subject
          </button>

          <div style={{ marginTop: "20px" }}>
            {subjectsNeeded.map((s) => (
              <div key={s.id} style={itemCard}>
                {s.name}: {s.count} sessions
                <button
                  onClick={() =>
                    setSubjectsNeeded(
                      subjectsNeeded.filter((x) => x.id !== s.id),
                    )
                  }
                  style={delStyle}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <button onClick={runEvolution} style={bigButtonStyle}>
        GENERATE TIMETABLE
      </button>

      {result && (
        <div style={{ marginTop: "30px" }}>
          <h2>Resulting Schedule</h2>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#2d3436", color: "white" }}>
                <th style={tdStyle}>Day</th>
                {DEFAULT_SLOTS.map((s) => (
                  <th key={s} style={tdStyle}>
                    {s}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DAYS.map((day) => (
                <tr key={day}>
                  <td style={{ ...tdStyle, fontWeight: "bold" }}>{day}</td>
                  {DEFAULT_SLOTS.map((slot) => {
                    const entry = result.find(
                      (r) => r.day === day && r.slot === slot,
                    );
                    return (
                      <td
                        key={slot}
                        style={{
                          ...tdStyle,
                          background:
                            entry?.sub === "FREE" ? "white" : "#fab1a0",
                        }}
                      >
                        {entry?.sub}
                        <br />
                        <small>{entry?.teacher}</small>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// Styles
const inputStyle = {
  width: "100%",
  padding: "10px",
  marginBottom: "10px",
  boxSizing: "border-box" as const,
};
const buttonStyle = {
  width: "100%",
  padding: "10px",
  background: "#0984e3",
  color: "white",
  border: "none",
  cursor: "pointer",
  borderRadius: "5px",
};
const bigButtonStyle = {
  width: "100%",
  marginTop: "30px",
  padding: "20px",
  background: "#00b894",
  color: "white",
  border: "none",
  fontSize: "1.2rem",
  cursor: "pointer",
  borderRadius: "10px",
};
const itemCard = {
  background: "white",
  padding: "10px",
  marginBottom: "5px",
  borderRadius: "5px",
  display: "flex",
  justifyContent: "space-between",
};
const delStyle = {
  color: "red",
  border: "none",
  background: "none",
  cursor: "pointer",
};
const tdStyle = {
  border: "1px solid #ddd",
  padding: "15px",
  textAlign: "center" as const,
};

export default ProfessionalScheduler;
