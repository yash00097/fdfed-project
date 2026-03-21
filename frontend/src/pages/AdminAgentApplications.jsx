import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  CheckCircle,
  Clock,
  Copy,
  ExternalLink,
  Mail,
  RefreshCw,
  Users,
  X,
  XCircle,
} from "lucide-react";

function createFallbackAgentEmail(app) {
  const presentYear = new Date().getFullYear();
  const nameSource =
    [app?.firstName, app?.lastName].filter(Boolean).join("") ||
    app?.userId?.username ||
    "agent";
  const normalizedName = nameSource.toLowerCase().replace(/[^a-z0-9]/g, "") || "agent";
  const randomNumber = String(Math.floor(Math.random() * 100)).padStart(2, "0");

  return `${normalizedName}${randomNumber}wheels${presentYear}@gmail.com`;
}

function ApproveModal({ app, onConfirm, onCancel, loading }) {
  const suggested = app?.suggestedAgentEmail || createFallbackAgentEmail(app);
  const [agentEmail, setAgentEmail] = useState(suggested);
  const [copied, setCopied] = useState(false);

  const isValid = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(agentEmail.trim());

  const handleCopy = () => {
    navigator.clipboard.writeText(agentEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-gray-700 bg-gray-800 shadow-2xl">
        <div className="h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400" />
        <div className="p-6">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
              <Mail className="h-5 w-5 text-blue-400" />
              Assign Agent Email
            </h3>
            <button
              onClick={onCancel}
              className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-700 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mb-5 rounded-xl border border-gray-700 bg-gray-900/40 p-4">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500">
              Applicant
            </p>
            <p className="text-base font-semibold text-white">
              {[app?.firstName, app?.lastName].filter(Boolean).join(" ") ||
                app?.userId?.username ||
                "Unknown"}
            </p>
            <p className="mt-1 text-sm text-gray-400">{app?.email}</p>
          </div>

          <div className="mb-4 rounded-xl border border-blue-500/20 bg-blue-500/10 p-4">
            <p className="text-sm font-medium text-blue-300">Suggested format</p>
            <p className="mt-1 text-xs leading-relaxed text-gray-400">
              The prefilled email is already checked for uniqueness and uses:
              <span className="ml-1 text-blue-300">
                name + 2 random digits + wheels + year @gmail.com
              </span>
            </p>
          </div>

          <label className="mb-2 block text-sm font-medium text-gray-300">
            Agent Email <span className="text-red-400">*</span>
          </label>
          <div className="relative mb-2">
            <input
              type="email"
              value={agentEmail}
              onChange={(e) => setAgentEmail(e.target.value)}
              placeholder="e.g. john42wheels2026@gmail.com"
              className={`w-full rounded-xl border bg-gray-900/60 px-4 py-3 pr-11 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 ${
                isValid
                  ? "border-gray-600 focus:border-blue-500 focus:ring-blue-500/30"
                  : "border-red-500/50 focus:border-red-500 focus:ring-red-500/30"
              }`}
            />
            <button
              type="button"
              onClick={handleCopy}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-white"
              title="Copy email"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
          <p className={`mb-5 text-xs ${isValid ? "text-emerald-400" : "text-red-400"}`}>
            {isValid ? "Valid email address" : "Please enter a valid email address."}
          </p>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 rounded-lg border border-gray-600 bg-gray-700 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={() => onConfirm(agentEmail.trim())}
              disabled={loading || !isValid}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Approving...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Approve
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function RejectModal({ app, onConfirm, onCancel, loading }) {
  const [reason, setReason] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-red-500/20 bg-gray-800 shadow-2xl">
        <div className="h-1 bg-gradient-to-r from-red-500 to-rose-500" />
        <div className="p-6">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
              <XCircle className="h-5 w-5 text-red-400" />
              Reject Application
            </h3>
            <button
              onClick={onCancel}
              className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-700 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mb-4 rounded-xl border border-gray-700 bg-gray-900/40 p-4">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500">
              Applicant
            </p>
            <p className="text-base font-semibold text-white">{app?.userId?.username || "Unknown"}</p>
            <p className="mt-1 text-sm text-gray-400">{app?.email}</p>
          </div>

          <label className="mb-2 block text-sm font-medium text-gray-300">
            Reason for Rejection <span className="font-normal text-gray-500">(optional)</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            placeholder="Provide feedback to the applicant..."
            className="mb-5 w-full resize-none rounded-xl border border-gray-600 bg-gray-900/60 px-4 py-3 text-sm text-gray-100 placeholder:text-gray-500 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30"
          />

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 rounded-lg border border-gray-600 bg-gray-700 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={() => onConfirm(reason)}
              disabled={loading}
              className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Rejecting..." : "Confirm Reject"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    pending: "border-yellow-500/30 bg-yellow-500/10 text-yellow-300",
    approved: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    rejected: "border-red-500/30 bg-red-500/10 text-red-300",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
        styles[status] || styles.pending
      }`}
    >
      {status?.charAt(0).toUpperCase() + status?.slice(1)}
    </span>
  );
}

function SummaryCard({ label, value, valueClassName = "text-white" }) {
  return (
    <div className="rounded-xl border border-gray-700 bg-gray-900/40 p-4">
      <p className="text-sm text-gray-400">{label}</p>
      <p className={`mt-2 text-2xl font-semibold ${valueClassName}`}>{value}</p>
    </div>
  );
}

function ApplicationsTable({
  applications,
  onApprove,
  onReject,
  actionLoading,
  targetId,
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-700 bg-gray-900/40">
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="border-b border-gray-700 bg-gray-900/30">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Applicant</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Contact</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Location</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Submitted</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Status</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Resume</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => {
              const isLoading = actionLoading && targetId === app._id;
              const fullName =
                [app.firstName, app.lastName].filter(Boolean).join(" ") ||
                app.userId?.username ||
                "Unknown";

              return (
                <tr key={app._id} className="border-b border-gray-800 last:border-b-0 hover:bg-gray-800/40">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-base font-semibold text-white">
                        {(app.firstName?.[0] || app.userId?.username?.[0] || "?").toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-white">{fullName}</p>
                        <p className="text-sm text-gray-400">
                          {app.gender || "Applicant"} · {app.yearsOfExperience || "No experience data"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm text-gray-200">{app.email}</p>
                    <p className="mt-1 text-sm text-gray-400">{app.phone || "No phone"}</p>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-300">
                    {[app.city, app.state].filter(Boolean).join(", ") || "Not provided"}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-300">
                    {new Date(app.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge status={app.status} />
                  </td>
                  <td className="px-4 py-4">
                    <a
                      href={app.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-gray-200 transition-colors hover:border-blue-500 hover:text-white"
                    >
                      <ExternalLink className="h-4 w-4" />
                      View
                    </a>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2 whitespace-nowrap">
                      <Link
                        to={`/admin/agent-applications/${app._id}`}
                        className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500"
                      >
                        View Details
                      </Link>
                      {app.status === "pending" && (
                        <>
                          <button
                            disabled={isLoading}
                            onClick={() => onApprove(app)}
                            className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-300 transition-colors hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isLoading ? "Working..." : "Approve"}
                          </button>
                          <button
                            disabled={isLoading}
                            onClick={() => onReject(app)}
                            className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-300 transition-colors hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function AdminAgentApplications() {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [targetId, setTargetId] = useState(null);
  const [toast, setToast] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [approveModal, setApproveModal] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [lastUpdated, setLastUpdated] = useState(null);

  if (!currentUser || currentUser.role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 px-4 text-white">
        <div className="rounded-2xl border border-red-500/30 bg-gray-800 p-8 text-center shadow-xl">
          <XCircle className="mx-auto mb-3 h-12 w-12 text-red-400" />
          <p className="text-lg font-semibold">Admin Access Required</p>
          <p className="mt-1 text-sm text-gray-400">You don&apos;t have permission to view this page.</p>
        </div>
      </div>
    );
  }

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchApplications = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/backend/agent-hiring/applications", { credentials: "include" });
      const data = await res.json();
      if (data.success) {
        setApplications(data.applications || []);
        setLastUpdated(new Date());
      } else {
        setError(data.message || "Failed to fetch applications.");
      }
    } catch {
      setError("Failed to fetch applications.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleApproveConfirm = async (agentEmail) => {
    if (!approveModal) return;
    setActionLoading(true);
    setTargetId(approveModal._id);
    try {
      const res = await fetch(`/backend/agent-hiring/approve/${approveModal._id}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentEmail }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("success", `Approved! Agent email ${agentEmail} assigned and notification sent.`);
        fetchApplications();
      } else {
        showToast("error", data.message || "Approval failed.");
      }
    } catch {
      showToast("error", "Approval failed. Please try again.");
    }
    setApproveModal(null);
    setActionLoading(false);
    setTargetId(null);
  };

  const handleRejectConfirm = async (reason) => {
    if (!rejectModal) return;
    setActionLoading(true);
    setTargetId(rejectModal._id);
    try {
      const res = await fetch(`/backend/agent-hiring/reject/${rejectModal._id}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminMessage: reason }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("success", "Application rejected and email sent to applicant.");
        fetchApplications();
      } else {
        showToast("error", data.message || "Rejection failed.");
      }
    } catch {
      showToast("error", "Rejection failed. Please try again.");
    }
    setRejectModal(null);
    setActionLoading(false);
    setTargetId(null);
  };

  const total = applications.length;
  const pending = applications.filter((app) => app.status === "pending").length;
  const approved = applications.filter((app) => app.status === "approved").length;
  const rejected = applications.filter((app) => app.status === "rejected").length;

  const filteredApplications =
    filterStatus === "all"
      ? applications
      : applications.filter((app) => app.status === filterStatus);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 px-4 pb-16 pt-32 text-white sm:px-6 sm:pt-36">
      {toast && (
        <div
          className={`fixed right-6 top-24 z-50 flex max-w-sm items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium shadow-2xl ${
            toast.type === "success"
              ? "border-emerald-500/50 bg-emerald-900/90 text-emerald-300"
              : "border-red-500/50 bg-red-900/90 text-red-300"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle className="h-5 w-5 flex-shrink-0" />
          ) : (
            <XCircle className="h-5 w-5 flex-shrink-0" />
          )}
          <span>{toast.msg}</span>
        </div>
      )}

      {approveModal && (
        <ApproveModal
          app={approveModal}
          onConfirm={handleApproveConfirm}
          onCancel={() => setApproveModal(null)}
          loading={actionLoading}
        />
      )}

      {rejectModal && (
        <RejectModal
          app={rejectModal}
          onConfirm={handleRejectConfirm}
          onCancel={() => setRejectModal(null)}
          loading={actionLoading}
        />
      )}

      <div className="mx-auto max-w-7xl rounded-2xl border border-gray-700 bg-gray-800 p-4 shadow-2xl sm:p-6">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-600"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Agent Applications</h1>
              <p className="mt-1 text-sm text-gray-400">
                Review, approve, and reject agent hiring requests.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {lastUpdated && (
              <span className="text-xs text-gray-400 sm:text-sm">
                Last updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={fetchApplications}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-600 bg-gray-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-600"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard label="Total Applications" value={total} valueClassName="text-white" />
          <SummaryCard label="Pending Review" value={pending} valueClassName="text-yellow-300" />
          <SummaryCard label="Approved" value={approved} valueClassName="text-emerald-400" />
          <SummaryCard label="Rejected" value={rejected} valueClassName="text-red-400" />
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {["all", "pending", "approved", "rejected"].map((status) => {
            const count =
              status === "all"
                ? total
                : status === "pending"
                ? pending
                : status === "approved"
                ? approved
                : rejected;

            return (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition-all ${
                  filterStatus === status
                    ? "border-blue-400 bg-blue-600 text-white"
                    : "border-gray-600 bg-gray-700 text-gray-200 hover:bg-gray-600"
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)} ({count})
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-600 border-t-blue-500" />
            <p className="mt-4 text-gray-400">Loading applications...</p>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-8 text-center">
            <XCircle className="mx-auto mb-3 h-10 w-10 text-red-400" />
            <p className="text-red-300">{error}</p>
            <button
              onClick={fetchApplications}
              className="mt-4 rounded-lg bg-gray-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-600"
            >
              Retry
            </button>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="rounded-2xl border border-gray-700 bg-gray-900/40 py-20 text-center">
            <Users className="mx-auto mb-3 h-12 w-12 text-gray-600" />
            <p className="font-medium text-gray-300">
              No {filterStatus === "all" ? "" : filterStatus} applications found
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Applications will appear here once users submit them.
            </p>
          </div>
        ) : (
          <ApplicationsTable
            applications={filteredApplications}
            onApprove={setApproveModal}
            onReject={setRejectModal}
            actionLoading={actionLoading}
            targetId={targetId}
          />
        )}
      </div>
    </div>
  );
}
