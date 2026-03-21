import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Briefcase,
  Car,
  Check,
  CheckCircle,
  Copy,
  FileCheck2,
  FileText,
  Mail,
  MapPin,
  RefreshCw,
  ShieldCheck,
  User,
  X,
  XCircle,
  AlertCircle,
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
            <p className="text-base font-semibold text-white">
              {[app?.firstName, app?.lastName].filter(Boolean).join(" ") ||
                app?.userId?.username ||
                "Unknown"}
            </p>
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

function SummaryItem({ label, value, valueClassName = "text-white" }) {
  return (
    <div className="rounded-xl border border-gray-700 bg-gray-900/40 p-4">
      <p className="text-sm text-gray-400">{label}</p>
      <p className={`mt-2 text-lg font-semibold ${valueClassName}`}>{value || "N/A"}</p>
    </div>
  );
}

function SectionCard({ icon, title, children, className = "" }) {
  return (
    <div className={`overflow-hidden rounded-2xl border border-gray-700 bg-gray-900/40 ${className}`}>
      <div className="flex items-center gap-3 border-b border-gray-700 bg-gray-900/40 px-5 py-4">
        <div className="rounded-lg bg-blue-500/10 p-2 text-blue-300">{icon}</div>
        <h3 className="text-base font-semibold text-white">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function DetailGrid({ children }) {
  return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>;
}

function DetailItem({ label, value, fullWidth = false }) {
  return (
    <div
      className={`rounded-xl border border-gray-700 bg-gray-800/60 p-4 ${
        fullWidth ? "sm:col-span-2" : ""
      }`}
    >
      <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500">{label}</p>
      <p className="text-sm leading-relaxed text-gray-200 break-words">{value || "N/A"}</p>
    </div>
  );
}

function DocumentLink({ label, url }) {
  return (
    <div className="rounded-xl border border-gray-700 bg-gray-800/60 p-4">
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500">{label}</p>
      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500"
        >
          <FileText className="h-4 w-4" />
          View Document
        </a>
      ) : (
        <p className="text-sm text-gray-400">Not provided</p>
      )}
    </div>
  );
}

function DocumentTile({ label, url }) {
  if (!url) {
    return (
      <div className="flex min-h-[140px] flex-col items-center justify-center rounded-xl border border-gray-700 bg-gray-800/60 p-5 text-center">
        <FileText className="mb-3 h-6 w-6 text-gray-500" />
        <p className="text-sm font-medium text-gray-400">{label} missing</p>
      </div>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex min-h-[140px] flex-col items-center justify-center rounded-xl border border-gray-700 bg-gray-800/60 p-5 text-center transition-colors hover:border-blue-500 hover:bg-gray-800"
    >
      <div className="mb-3 rounded-full border border-gray-600 bg-gray-900 p-3 text-blue-300">
        <FileText className="h-5 w-5" />
      </div>
      <p className="text-sm font-medium text-gray-200">{label}</p>
    </a>
  );
}

export default function AdminApplicationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [approveModal, setApproveModal] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    fetchApplicationDetails();
  }, [id]);

  const fetchApplicationDetails = async () => {
    try {
      const res = await fetch(`/backend/agent-hiring/${id}`);
      const data = await res.json();
      if (!data.success) {
        setError(data.message || "Failed to load application details.");
      } else {
        setApp(data.application);
        setLastUpdated(new Date());
        setError(null);
      }
    } catch {
      setError("An error occurred while fetching details.");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const handleApproveConfirm = async (agentEmail) => {
    if (!approveModal) return;
    setActionLoading(true);
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
        fetchApplicationDetails();
      } else {
        showToast("error", data.message || "Approval failed.");
      }
    } catch {
      showToast("error", "Approval failed. Please try again.");
    }
    setApproveModal(null);
    setActionLoading(false);
  };

  const handleRejectConfirm = async (reason) => {
    if (!rejectModal) return;
    setActionLoading(true);
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
        fetchApplicationDetails();
      } else {
        showToast("error", data.message || "Rejection failed.");
      }
    } catch {
      showToast("error", "Rejection failed. Please try again.");
    }
    setRejectModal(null);
    setActionLoading(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 px-4 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-600 border-t-blue-500" />
          <p className="text-gray-400">Loading application details...</p>
        </div>
      </div>
    );
  }

  if (error || !app) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 px-4 text-white">
        <div className="rounded-2xl border border-red-500/30 bg-gray-800 p-8 text-center shadow-xl">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-400" />
          <h2 className="text-xl font-semibold">Error</h2>
          <p className="mt-2 text-sm text-red-300">{error || "Application not found"}</p>
          <button
            onClick={() => navigate("/admin/agent-applications")}
            className="mt-6 rounded-lg bg-gray-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const fullName = [app.firstName, app.lastName].filter(Boolean).join(" ") || "Unknown";
  const boolYesNo = (value) => (value ? "Yes" : "No");

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
              onClick={() => navigate("/admin/agent-applications")}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-600"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Application Details</h1>
              <p className="mt-1 text-sm text-gray-400">
                Full review of the submitted agent hiring form.
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
              onClick={fetchApplicationDetails}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-600 bg-gray-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-600"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>

        <div className="mb-8 rounded-2xl border border-gray-700 bg-gray-900/40 p-5">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-xl font-semibold text-white">
                {(app.firstName?.[0] || app.userId?.username?.[0] || "?").toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">{fullName}</h2>
                <p className="mt-1 text-sm text-gray-400">{app.email}</p>
                <p className="mt-1 text-sm text-gray-500">
                  Submitted on{" "}
                  {new Date(app.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-start gap-3 lg:items-end">
              <StatusBadge status={app.status} />
              {app.agentEmail && (
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
                  Assigned: {app.agentEmail}
                </div>
              )}
              {app.status === "pending" && (
                <div className="flex flex-wrap gap-2">
                  <button
                    disabled={actionLoading}
                    onClick={() => setApproveModal(app)}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Approve
                  </button>
                  <button
                    disabled={actionLoading}
                    onClick={() => setRejectModal(app)}
                    className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-300 transition-colors hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <SummaryItem label="Phone Number" value={app.phone} />
          <SummaryItem label="Preferred City" value={app.preferredWorkingCity} />
          <SummaryItem label="Employment Type" value={app.employmentType} />
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <SectionCard icon={<User className="h-5 w-5" />} title="1. Personal Details">
            <DetailGrid>
              <DetailItem label="First Name" value={app.firstName} />
              <DetailItem label="Last Name" value={app.lastName} />
              <DetailItem label="Date of Birth" value={app.dateOfBirth} />
              <DetailItem label="Gender" value={app.gender} />
            </DetailGrid>
          </SectionCard>

          <SectionCard icon={<MapPin className="h-5 w-5" />} title="2. Contact Details">
            <DetailGrid>
              <DetailItem label="Phone Number" value={app.phone} />
              <DetailItem label="Address" value={app.address} />
              <DetailItem label="City" value={app.city} />
              <DetailItem label="State" value={app.state} />
              <DetailItem label="Pincode" value={app.pincode} />
            </DetailGrid>
          </SectionCard>

          <SectionCard icon={<ShieldCheck className="h-5 w-5" />} title="3. Identity Verification">
            <div className="space-y-4">
              <DetailGrid>
                <DetailItem label="Aadhar Number" value={app.aadharNumber} fullWidth />
              </DetailGrid>
              <DocumentLink label="ID Proof Document" url={app.idProofUrl} />
            </div>
          </SectionCard>

          <SectionCard icon={<Car className="h-5 w-5" />} title="4. Driving Information">
            <div className="space-y-4">
              <DetailGrid>
                <DetailItem label="License Number" value={app.drivingLicenseNumber} />
                <DetailItem
                  label="Expiry Date"
                  value={
                    app.licenseExpiryDate
                      ? new Date(app.licenseExpiryDate).toLocaleDateString("en-IN")
                      : "N/A"
                  }
                />
              </DetailGrid>
              <DocumentLink label="Driving License Document" url={app.drivingLicenseUrl} />
            </div>
          </SectionCard>

          <SectionCard icon={<Briefcase className="h-5 w-5" />} title="5. Work Experience">
            <DetailGrid>
              <DetailItem label="Current Job" value={app.currentJob || "None"} />
              <DetailItem label="Previous Job" value={app.previousJob || "None"} />
              <DetailItem label="Years of Experience" value={app.yearsOfExperience} />
              <DetailItem label="Car Sales Experience" value={boolYesNo(app.hasCarSalesExperience)} />
            </DetailGrid>
          </SectionCard>

          <SectionCard icon={<Car className="h-5 w-5" />} title="6. Automobile Knowledge">
            <DetailGrid>
              <DetailItem label="General Knowledge" value={app.carKnowledge} fullWidth />
              <DetailItem
                label="Transaction Experience"
                value={app.vehicleTransactionExperience || "N/A"}
                fullWidth
              />
            </DetailGrid>
          </SectionCard>

          <SectionCard icon={<MapPin className="h-5 w-5" />} title="7. Work Location">
            <DetailGrid>
              <DetailItem label="Preferred City" value={app.preferredWorkingCity} />
              <DetailItem label="Willing to Travel" value={boolYesNo(app.willingToTravel)} />
            </DetailGrid>
          </SectionCard>

          <SectionCard icon={<Briefcase className="h-5 w-5" />} title="8 & 9. Availability & Skills">
            <DetailGrid>
              <DetailItem label="Employment Type" value={app.employmentType} />
              <DetailItem label="Available Days" value={app.availableWorkingDays} />
              <DetailItem label="Languages Known" value={app.languagesKnown || "N/A"} fullWidth />
              <DetailItem
                label="Customer Handling Experience"
                value={app.customerHandlingExperience || "N/A"}
              />
              <DetailItem label="Sales Experience" value={app.salesExperience || "N/A"} />
            </DetailGrid>
          </SectionCard>

          <SectionCard
            icon={<User className="h-5 w-5" />}
            title="10. References"
            className="xl:col-span-2"
          >
            <DetailGrid>
              <DetailItem label="Reference Name" value={app.referenceName || "N/A"} />
              <DetailItem label="Reference Phone" value={app.referencePhone || "N/A"} />
            </DetailGrid>
          </SectionCard>

          <SectionCard
            icon={<FileText className="h-5 w-5" />}
            title="11. Motivation"
            className="xl:col-span-2"
          >
            <DetailGrid>
              <DetailItem
                label="Why become an agent?"
                value={app.motivation || "N/A"}
                fullWidth
              />
            </DetailGrid>
          </SectionCard>

          <SectionCard
            icon={<FileCheck2 className="h-5 w-5" />}
            title="12. Key Documents"
            className="xl:col-span-2"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <DocumentTile label="Resume" url={app.resumeUrl} />
              <DocumentTile label="Address Proof" url={app.addressProofUrl} />
              <DocumentTile label="ID Proof" url={app.idProofUrl} />
              <DocumentTile label="Driving License" url={app.drivingLicenseUrl} />
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
