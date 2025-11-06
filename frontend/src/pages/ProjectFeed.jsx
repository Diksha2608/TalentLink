import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import ProjectCard from "../components/ProjectCard";
import { projectsAPI } from "../api/projects";

const DURATION = [
  { value: "less_1_month", label: "Less than 1 month" },
  { value: "1_3_months", label: "1 - 3 months" },
  { value: "3_6_months", label: "3 - 6 months" },
  { value: "6_plus_months", label: "6+ months" }
];

const HOURS_PER_WEEK = [
  { value: "less_30", label: "Less than 30 hrs/week" },
  { value: "more_30", label: "More than 30 hrs/week" }
];

const PROPOSALS = [
  { value: "0", label: "0 proposals" },
  { value: "1_5", label: "1 - 5" },
  { value: "6_15", label: "6 - 15" },
  { value: "15_30", label: "15 - 30" },
  { value: "30_plus", label: "30+" }
];

const JOB_TYPES = [
  { value: "hourly", label: "Hourly" },
  { value: "fixed", label: "Fixed Price" }
];

const FIXED_PAYMENT = [
  { value: "less_1000", label: "Less than ₹1,000" },
  { value: "1000_5000", label: "₹1,000 - ₹5,000" },
  { value: "5000_10000", label: "₹5,000 - ₹10,000" },
  { value: "10000_25000", label: "₹10,000 - ₹25,000" },
  { value: "25000_plus", label: "₹25,000+" }
];

function HourlyInputs({ min, max, setMin, setMax }) {
  return (
    <div className="mt-2 ml-4">
      <label className="block text-xs font-semibold mb-1 text-gray-600">
        Hourly Rate (₹/hr)
      </label>
      <div className="flex gap-2">
        <input
          type="number"
          placeholder="Min"
          value={min}
          min={0}
          onChange={e => setMin(e.target.value)}
          className="border p-2 rounded w-1/2 text-sm"
        />
        <input
          type="number"
          placeholder="Max"
          value={max}
          min={0}
          onChange={e => setMax(e.target.value)}
          className="border p-2 rounded w-1/2 text-sm"
        />
      </div>
    </div>
  );
}

export default function ProjectFeed() {
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [duration, setDuration] = useState([]);
  const [hoursPerWeek, setHoursPerWeek] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [jobTypes, setJobTypes] = useState([]);
  const [fixedPayment, setFixedPayment] = useState([]);
  const [hourlyMin, setHourlyMin] = useState("");
  const [hourlyMax, setHourlyMax] = useState("");
  const [status, setStatus] = useState("open");
  const [loading, setLoading] = useState(true);

  // Checkbox toggle handler
  const handleCheckbox = (arr, setArr, v) => {
    setArr(arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v]);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setDuration([]);
    setHoursPerWeek([]);
    setProposals([]);
    setJobTypes([]);
    setFixedPayment([]);
    setHourlyMin("");
    setHourlyMax("");
  };

  // Fetch projects whenever filters change
  useEffect(() => {
    setLoading(true);

    const filterParams = {
      status,
      search: searchTerm,
      duration: duration.join(","),
      hours_per_week: hoursPerWeek.join(","),
      proposal_range: proposals.join(","),
      job_type: jobTypes.join(",")
    };

    if (jobTypes.includes("fixed")) {
      filterParams.fixed_payment = fixedPayment.join(",");
    }

    if (jobTypes.includes("hourly")) {
      if (hourlyMin) filterParams.hourly_min = hourlyMin;
      if (hourlyMax) filterParams.hourly_max = hourlyMax;
    }

    console.log("=== Sending filter params ===", JSON.stringify(filterParams, null, 2));

    projectsAPI
      .list(filterParams)
      .then(res => {
        const projectData = res.data.results || res.data;
        console.log(`✅ Received ${projectData.length} projects`);
        setProjects(projectData);
      })
      .catch(err => {
        console.error("❌ Error fetching projects:", err);
        setProjects([]);
      })
      .finally(() => setLoading(false));
  }, [
    status,
    duration,
    hoursPerWeek,
    proposals,
    jobTypes,
    fixedPayment,
    hourlyMin,
    hourlyMax,
    searchTerm
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-purple-100 to-white py-10">
      <div className="container mx-auto px-4">
        {/* ========================================== */}
        {/* SECTION 1: SEARCH & STATUS (COMBINED) */}
        {/* ========================================== */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-purple-800 mb-4">
            Search Projects
          </h2>
          <form
            onSubmit={e => {
              e.preventDefault();
            }}
            className="flex flex-col md:flex-row gap-4"
          >
            {/* Search Input */}
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Search by keyword or skill
              </label>
              <input
                type="text"
                placeholder="🔍 Enter keyword, skill, or project title..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="border border-gray-300 px-4 py-3 rounded-lg w-full focus:ring-2 focus:ring-purple-400 focus:outline-none"
              />
            </div>

            {/* Status Dropdown */}
            <div className="md:w-48">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Project Status
              </label>
              <select
                className="border border-gray-300 p-3 rounded-lg w-full text-purple-800 font-bold focus:ring-2 focus:ring-purple-400 focus:outline-none"
                value={status}
                onChange={e => setStatus(e.target.value)}
              >
                <option value="open">Open</option>
                <option value="in_progress">Ongoing</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Search Button */}
            <div className="flex items-end">
              <button
                type="submit"
                className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-8 py-3 rounded-lg font-bold hover:from-purple-700 hover:to-purple-800 transition shadow-md flex items-center gap-2 h-[46px]"
              >
                <Search size={20} />
                Search
              </button>
            </div>
          </form>
        </div>

        {/* ========================================== */}
        {/* SECTION 2: FILTERS & PROJECT RESULTS */}
        {/* ========================================== */}
        <div className="flex gap-7">
          {/* FILTER SIDEBAR */}
          <aside className="w-80 bg-white rounded-xl shadow-lg p-6 shrink-0 h-fit sticky top-4">
            <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-purple-200">
              <h3 className="font-bold text-xl text-purple-800">Filters</h3>
              <button
                type="button"
                className="text-xs bg-purple-100 hover:bg-purple-200 text-purple-700 font-bold px-3 py-1.5 rounded-md transition"
                onClick={clearAllFilters}
              >
                Clear All
              </button>
            </div>

            {/* Project Length */}
            <div className="mb-6">
              <div className="text-sm font-bold text-gray-800 mb-3 uppercase tracking-wide">
                📅 Project Length
              </div>
              {DURATION.map(o => (
                <label
                  key={o.value}
                  className="flex items-center ml-2 py-2 cursor-pointer hover:bg-purple-50 rounded px-2 transition"
                >
                  <input
                    type="checkbox"
                    checked={duration.includes(o.value)}
                    onChange={() => handleCheckbox(duration, setDuration, o.value)}
                    className="mr-3 w-4 h-4 accent-purple-600 cursor-pointer"
                  />
                  <span className="text-sm text-gray-700">{o.label}</span>
                </label>
              ))}
            </div>

            <div className="border-t border-gray-200 my-4" />

            {/* Hours per Week */}
            <div className="mb-6">
              <div className="text-sm font-bold text-gray-800 mb-3 uppercase tracking-wide">
                ⏰ Hours / Week
              </div>
              {HOURS_PER_WEEK.map(o => (
                <label
                  key={o.value}
                  className="flex items-center ml-2 py-2 cursor-pointer hover:bg-purple-50 rounded px-2 transition"
                >
                  <input
                    type="checkbox"
                    checked={hoursPerWeek.includes(o.value)}
                    onChange={() =>
                      handleCheckbox(hoursPerWeek, setHoursPerWeek, o.value)
                    }
                    className="mr-3 w-4 h-4 accent-purple-600 cursor-pointer"
                  />
                  <span className="text-sm text-gray-700">{o.label}</span>
                </label>
              ))}
            </div>

            <div className="border-t border-gray-200 my-4" />

            {/* Proposal Count */}
            <div className="mb-6">
              <div className="text-sm font-bold text-gray-800 mb-3 uppercase tracking-wide">
                📝 Number of Proposals
              </div>
              {PROPOSALS.map(o => (
                <label
                  key={o.value}
                  className="flex items-center ml-2 py-2 cursor-pointer hover:bg-purple-50 rounded px-2 transition"
                >
                  <input
                    type="checkbox"
                    checked={proposals.includes(o.value)}
                    onChange={() => handleCheckbox(proposals, setProposals, o.value)}
                    className="mr-3 w-4 h-4 accent-purple-600 cursor-pointer"
                  />
                  <span className="text-sm text-gray-700">{o.label}</span>
                </label>
              ))}
            </div>

            <div className="border-t border-gray-200 my-4" />

            {/* Job Type & Payment */}
            <div className="mb-6">
              <div className="text-sm font-bold text-gray-800 mb-3 uppercase tracking-wide">
                💼 Job Type & Payment
              </div>
              {JOB_TYPES.map(o => (
                <label
                  key={o.value}
                  className="flex items-center ml-2 py-2 cursor-pointer hover:bg-purple-50 rounded px-2 transition"
                >
                  <input
                    type="checkbox"
                    checked={jobTypes.includes(o.value)}
                    onChange={() => handleCheckbox(jobTypes, setJobTypes, o.value)}
                    className="mr-3 w-4 h-4 accent-purple-600 cursor-pointer"
                  />
                  <span className="text-sm font-bold text-gray-700">{o.label}</span>
                </label>
              ))}

              {jobTypes.includes("hourly") && (
                <HourlyInputs
                  min={hourlyMin}
                  max={hourlyMax}
                  setMin={setHourlyMin}
                  setMax={setHourlyMax}
                />
              )}

              {jobTypes.includes("fixed") && (
                <div className="mt-3 ml-4">
                  <div className="text-xs font-semibold mb-2 text-gray-600">
                    Fixed Price Ranges
                  </div>
                  {FIXED_PAYMENT.map(o => (
                    <label
                      key={o.value}
                      className="flex items-center py-1.5 cursor-pointer hover:bg-purple-50 rounded px-2 transition"
                    >
                      <input
                        type="checkbox"
                        checked={fixedPayment.includes(o.value)}
                        onChange={() =>
                          handleCheckbox(fixedPayment, setFixedPayment, o.value)
                        }
                        className="mr-2 w-4 h-4 accent-purple-600 cursor-pointer"
                      />
                      <span className="text-sm text-gray-700">{o.label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </aside>

          {/* PROJECT RESULTS */}
          <main className="flex-1">
            {loading ? (
              <div className="text-center mt-20 text-purple-500 font-bold text-xl animate-pulse">
                🔄 Loading projects...
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center mt-20">
                <div className="text-6xl mb-4">📭</div>
                <div className="text-purple-500 font-bold text-2xl">
                  No projects found
                </div>
                <p className="text-gray-500 mt-2">
                  Try adjusting your filters or search terms
                </p>
              </div>
            ) : (
              <>
                <div className="mb-4 text-gray-600">
                  <span className="font-bold text-purple-800">{projects.length}</span>{" "}
                  project{projects.length !== 1 ? "s" : ""} found
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {projects.map(project => (
                    <div key={project.id} className="transition hover:scale-[1.02]">
                      <ProjectCard project={project} />
                    </div>
                  ))}
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
