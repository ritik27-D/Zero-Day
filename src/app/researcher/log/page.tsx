"use client";

import { FormEvent, useState } from "react";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { submitResearcherLogAction } from "@/app/researcher/actions";

const initialForm = {
  projectName: "",
  mentorName: "",
  date: "",
  duration: "",
  mentorAttendance: "Present",
  studentAttendance: "Present",
  attendanceMode: "Physical",
};

export default function ResearcherLogPage() {
  const [form, setForm] = useState(initialForm);
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState("");

  const updateField = (field: keyof typeof initialForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setSubmitted(false);
    setPdfBytes(null);
    setMessage("");
  };

  const createPdf = async () => {
    const document = await PDFDocument.create();
    const page = document.addPage([595.28, 841.89]);
    const regularFont = await document.embedFont(StandardFonts.Helvetica);
    const boldFont = await document.embedFont(StandardFonts.HelveticaBold);
    const navy = rgb(0.09, 0.19, 0.26);
    const teal = rgb(0.05, 0.47, 0.43);

    page.drawText("Islington R&D Connect", {
      x: 48,
      y: 778,
      size: 20,
      font: boldFont,
      color: navy,
    });
    page.drawText("Researcher Activity Log", {
      x: 48,
      y: 748,
      size: 14,
      font: boldFont,
      color: teal,
    });
    page.drawLine({
      start: { x: 48, y: 732 },
      end: { x: 547, y: 732 },
      thickness: 1,
      color: rgb(0.82, 0.86, 0.87),
    });

    const rows = [
      ["Project name", form.projectName],
      ["Mentor name", form.mentorName],
      ["Date", form.date],
      ["Time / duration", form.duration],
      ["Mentor attendance", form.mentorAttendance],
      ["Student attendance", form.studentAttendance],
      ["Attendance mode", form.attendanceMode],
    ];

    let y = 690;
    rows.forEach(([label, value]) => {
      page.drawText(label, { x: 52, y, size: 10, font: boldFont, color: navy });
      page.drawText(value || "-", { x: 220, y, size: 11, font: regularFont, color: rgb(0.2, 0.24, 0.26) });
      page.drawLine({
        start: { x: 52, y: y - 9 },
        end: { x: 543, y: y - 9 },
        thickness: 0.5,
        color: rgb(0.9, 0.91, 0.91),
      });
      y -= 45;
    });

    page.drawText("Submitted through the authenticated researcher portal.", {
      x: 52,
      y: 350,
      size: 9,
      font: regularFont,
      color: rgb(0.38, 0.43, 0.45),
    });

    return document.save();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = await submitResearcherLogAction(new FormData(event.currentTarget));
    if (!result.success) {
      setSubmitted(false);
      setMessage(result.message);
      return;
    }
    const bytes = await createPdf();
    setPdfBytes(bytes);
    setSubmitted(true);
    setMessage(result.message);
  };

  const downloadPdf = () => {
    if (!pdfBytes) return;
    const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `researcher-log-${form.date || "record"}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <div className="border-b border-slate-200 pb-5">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-cyan-700">Researcher Log</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900">Record research activity</h1>
        <p className="mt-2 text-base text-slate-600">
          Submit a meeting or supervision record and download a formatted PDF for your files.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-semibold text-slate-700">
            Project name
            <input
              required
              name="project_name"
              value={form.projectName}
              onChange={(event) => updateField("projectName", event.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base font-normal text-slate-900 focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-600"
              placeholder="e.g. Campus Network Security Study"
            />
          </label>

          <label className="text-sm font-semibold text-slate-700">
            Mentor name
            <input
              required
              name="mentor_name"
              value={form.mentorName}
              onChange={(event) => updateField("mentorName", event.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base font-normal text-slate-900 focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-600"
              placeholder="e.g. Dr Aisha Rahman"
            />
          </label>

          <label className="text-sm font-semibold text-slate-700">
            Day
            <input
              required
              type="date"
              name="activity_date"
              value={form.date}
              onChange={(event) => updateField("date", event.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base font-normal text-slate-900 focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-600"
            />
          </label>

          <label className="text-sm font-semibold text-slate-700">
            Time / duration
            <input
              required
              name="duration"
              value={form.duration}
              onChange={(event) => updateField("duration", event.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base font-normal text-slate-900 focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-600"
              placeholder="e.g. 10:00-11:30 (90 minutes)"
            />
          </label>

          <label className="text-sm font-semibold text-slate-700">
            Mentor attendance
            <select
              value={form.mentorAttendance}
              name="mentor_attendance"
              onChange={(event) => updateField("mentorAttendance", event.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base font-normal text-slate-900 focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-600"
            >
              <option>Present</option>
              <option>Absent</option>
              <option>Partially attended</option>
            </select>
          </label>

          <label className="text-sm font-semibold text-slate-700">
            Student attendance
            <select
              value={form.studentAttendance}
              name="student_attendance"
              onChange={(event) => updateField("studentAttendance", event.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base font-normal text-slate-900 focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-600"
            >
              <option>Present</option>
              <option>Absent</option>
              <option>Partially attended</option>
            </select>
          </label>

          <label className="text-sm font-semibold text-slate-700">
            Attendance mode
            <select
              value={form.attendanceMode}
              name="attendance_mode"
              onChange={(event) => updateField("attendanceMode", event.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base font-normal text-slate-900 focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-600"
            >
              <option>Physical</option>
              <option>Offline</option>
            </select>
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-5">
          <button
            type="submit"
            className="rounded-lg bg-cyan-700 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-cyan-800"
          >
            Submit log
          </button>
          {message && (
            <span className={`text-sm font-semibold ${submitted ? "text-emerald-700" : "text-rose-700"}`}>
              {message}
            </span>
          )}
          {pdfBytes && (
            <button
              type="button"
              onClick={downloadPdf}
              className="rounded-lg border border-cyan-300 bg-cyan-50 px-5 py-2.5 text-sm font-bold text-cyan-800 transition hover:bg-cyan-100"
            >
              Download PDF
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
