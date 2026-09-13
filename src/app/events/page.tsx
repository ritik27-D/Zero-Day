import Link from "next/link";
import LayoutShell from "@/components/layout-shell";
import { getEvents } from "@/lib/hub-data";

export default async function EventsPage(props: {
  searchParams: Promise<{ type?: string; q?: string }>;
}) {
  const searchParams = await props.searchParams;
  const filterType = searchParams?.type || "all";
  const searchQuery = (searchParams?.q || "").toLowerCase().trim();

  const allEvents = await getEvents();

  const eventTypes = [
    { id: "all", label: "All Events" },
    { id: "upcoming", label: "Upcoming Events" },
    { id: "conference", label: "Conferences" },
    { id: "seminar", label: "Seminars" },
    { id: "workshop", label: "Workshops" },
    { id: "call_for_papers", label: "Calls for Papers" },
    { id: "proceedings", label: "Proceedings" },
    { id: "past", label: "Past Events" },
  ];

  const now = new Date();

  const filteredEvents = allEvents.filter((e) => {
    let matchesType = true;
    if (filterType === "all") {
      matchesType = true;
    } else if (filterType === "upcoming") {
      matchesType = !e.start_date || new Date(e.start_date) >= now;
    } else if (filterType === "past") {
      matchesType = Boolean(e.start_date && new Date(e.start_date) < now);
    } else if (filterType === "proceedings") {
      matchesType =
        e.type === "conference" ||
        e.title.toLowerCase().includes("proceeding") ||
        e.description.toLowerCase().includes("proceeding") ||
        e.type === "call_for_papers";
    } else if (filterType === "workshop") {
      matchesType = e.type === "workshop" || e.type === "masterclass";
    } else {
      matchesType = e.type === filterType;
    }

    const matchesQuery =
      !searchQuery ||
      e.title.toLowerCase().includes(searchQuery) ||
      e.description.toLowerCase().includes(searchQuery) ||
      (e.location && e.location.toLowerCase().includes(searchQuery));

    return matchesType && matchesQuery;
  });

  return (
    <LayoutShell activeNav="events">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200/80 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-700">
              <span className="w-2 h-2 rounded-full bg-cyan-500" />
              <span>R&amp;D Events &amp; Conferences &bull; Academic Symposia</span>
            </div>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">
              Conferences, Seminars, Workshops &amp; Symposia
            </h1>
            <p className="mt-2 text-sm text-slate-600 max-w-2xl">
              Explore upcoming academic conferences, technical workshops, faculty seminars, calls for papers, and conference proceedings hosted across Islington College.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
              {filteredEvents.length} Event{filteredEvents.length !== 1 ? "s" : ""} Available
            </span>
          </div>
        </div>

        {/* Handbook Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-1.5">
            {eventTypes.map((t) => (
              <Link
                key={t.id}
                href={`/events?type=${t.id}${searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ""}`}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  filterType === t.id
                    ? "bg-cyan-700 text-white shadow-xs"
                    : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {t.label}
              </Link>
            ))}
          </div>

          {/* Search Filter */}
          <form className="relative w-full sm:w-64">
            <input
              type="text"
              name="q"
              defaultValue={searchQuery}
              placeholder="Filter events..."
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-cyan-600"
            />
            {filterType !== "all" && <input type="hidden" name="type" value={filterType} />}
          </form>
        </div>

        {/* Proceedings Highlight Banner if Proceedings Tab Selected */}
        {filterType === "proceedings" && (
          <div className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">
                Conference Proceedings Index
              </span>
              <h3 className="text-base font-bold text-slate-900">
                Peer-Reviewed Conference Proceedings &amp; Symposium Archives
              </h3>
              <p className="text-xs text-slate-600">
                Full-text proceedings from Islington-hosted conferences are archived with DOIs and indexed in the IJMR repository.
              </p>
            </div>
            <Link
              href="/ijmr"
              className="px-3.5 py-1.5 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold shrink-0 transition"
            >
              Open Proceedings Gateway &rarr;
            </Link>
          </div>
        )}

        {/* Event Cards Grid */}
        {filteredEvents.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
            <p className="text-sm font-semibold text-slate-700">No events matched your search criteria.</p>
            <p className="mt-1 text-xs text-slate-500">Try selecting &quot;All Events&quot; or clearing your search term.</p>
            <Link
              href="/events"
              className="mt-4 inline-block text-xs font-bold text-cyan-700 hover:underline"
            >
              Reset Filters
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((evt) => {
              const startDateFormatted = evt.start_date
                ? new Date(evt.start_date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "TBA";

              return (
                <div
                  key={evt.id}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:shadow-md transition flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-cyan-50 text-cyan-700 border border-cyan-200">
                        {evt.type.replace(/_/g, " ")}
                      </span>
                    </div>

                    <Link href={`/events/${evt.slug}`} className="block group">
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-cyan-700 transition line-clamp-2">
                        {evt.title}
                      </h3>
                    </Link>

                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {evt.description}
                    </p>

                    <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-500">
                      <div className="flex items-center gap-2">
                        <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{startDateFormatted}</span>
                      </div>

                      {evt.location && (
                        <div className="flex items-center gap-2">
                          <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="truncate">{evt.location}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <Link
                      href={`/events/${evt.slug}`}
                      className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1 hover:underline"
                    >
                      <span>Event Details</span>
                      <span>&rarr;</span>
                    </Link>

                    <Link
                      href={`/events/${evt.slug}#register`}
                      className="text-xs font-semibold px-3 py-1 rounded-lg bg-teal-50 text-teal-800 hover:bg-teal-100 transition"
                    >
                      Register
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </LayoutShell>
  );
}
