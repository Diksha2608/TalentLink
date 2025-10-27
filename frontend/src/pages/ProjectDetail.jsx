// frontend/src/pages/ProjectDetail.jsx
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { IndianRupee , Clock, Calendar, X } from "lucide-react";
import { projectsAPI } from "../api/projects";
import { proposalsAPI } from "../api/proposals";
import { formatCurrency } from '../utils/currency';

export default function ProjectDetail({ user }) {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [proposalForm, setProposalForm] = useState({
    cover_letter: "",
    bid_amount: "",
    estimated_time: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const projectRes = await projectsAPI.get(id);
        setProject(projectRes.data);

        if (user?.role === "client") {
          const proposalsRes = await projectsAPI.getProposals(id);
          setProposals(proposalsRes.data);
        }
      } catch (err) {
        console.error("Error loading data:", err);
      }
    };

    loadData();
  }, [id, user?.role]);

  const handleSubmitProposal = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await proposalsAPI.create({
        project: id,
        ...proposalForm,
      });
      setShowProposalModal(false);
      setProposalForm({ cover_letter: "", bid_amount: "", estimated_time: "" });
      alert("Proposal submitted successfully!");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to submit proposal");
    }
  };

  const handleAcceptProposal = async (proposalId) => {
    try {
      await proposalsAPI.accept(proposalId);
      const updated = await projectsAPI.getProposals(id);
      setProposals(updated.data);
      alert("Proposal accepted! Contract created.");
    } catch {
      alert("Failed to accept proposal");
    }
  };

  const handleRejectProposal = async (proposalId) => {
    try {
      await proposalsAPI.reject(proposalId);
      const updated = await projectsAPI.getProposals(id);
      setProposals(updated.data);
      alert("Proposal rejected");
    } catch {
      alert("Failed to reject proposal");
    }
  };

  if (!project) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Project Details */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <h1 className="text-4xl font-bold mb-4">{project.title}</h1>
          <p className="text-gray-600 mb-6">{project.description}</p>

          <div className="flex flex-wrap gap-4 mb-6">
            {project.skills_required?.map((skill, index) => (
              <span
                key={skill.id || index}
                className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full font-medium"
              >
                {skill.name}
              </span>
            ))}
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center gap-2 text-gray-700">
              <IndianRupee size={20} />

              <span>
                <strong>Budget:</strong> {formatCurrency(project.budget_min)} - {formatCurrency(project.budget_max)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Clock size={20} />
              <span>
                <strong>Duration:</strong>{" "}
                {project.duration_estimate?.replace("_", " ")}
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Calendar size={20} />
              <span>
                <strong>Posted:</strong>{" "}
                {new Date(project.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          {user?.role === "freelancer" && project.status === "open" && (
            <button
              onClick={() => setShowProposalModal(true)}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700"
            >
              Submit Proposal
            </button>
          )}
        </div>

        {/* Client View: Proposals List */}
        {user?.role === "client" && proposals.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-semibold mb-6">Proposals Received</h2>
            <div className="space-y-6">
              {proposals.map((proposal) => (
                <div
                  key={proposal.id}
                  className="border border-gray-200 rounded-lg p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {proposal.freelancer_name}
                      </h3>
                      <p className="text-gray-600">Bid: INR{proposal.bid_amount}</p>
                      <p className="text-gray-600">
                        Estimated Time: {proposal.estimated_time}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        proposal.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : proposal.status === "accepted"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {proposal.status}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-4">{proposal.cover_letter}</p>
                  {proposal.status === "pending" && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleAcceptProposal(proposal.id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleRejectProposal(proposal.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Freelancer Modal */}
        {showProposalModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full p-8 relative max-h-screen overflow-y-auto">
              <button
                onClick={() => setShowProposalModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>

              <h2 className="text-2xl font-bold mb-6">Submit Your Proposal</h2>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmitProposal} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cover Letter
                  </label>
                  <textarea
                    required
                    value={proposalForm.cover_letter}
                    onChange={(e) =>
                      setProposalForm({
                        ...proposalForm,
                        cover_letter: e.target.value,
                      })
                    }
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Explain why you're the best fit for this project..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Bid Amount (USD)
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={proposalForm.bid_amount}
                    onChange={(e) =>
                      setProposalForm({
                        ...proposalForm,
                        bid_amount: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., 500.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Completion Time
                  </label>
                  <input
                    type="text"
                    required
                    value={proposalForm.estimated_time}
                    onChange={(e) =>
                      setProposalForm({
                        ...proposalForm,
                        estimated_time: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., 2 weeks"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700"
                >
                  Submit Proposal
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
