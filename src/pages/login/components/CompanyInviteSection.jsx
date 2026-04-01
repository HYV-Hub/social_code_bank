import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../../../components/AppIcon";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";

const CompanyInviteSection = () => {
  const navigate = useNavigate();
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Mock valid invite codes
  const validInviteCodes = [
    "TECHCORP-2025-ADMIN",
    "DEVTEAM-INVITE-001",
    "ENTERPRISE-ACCESS-XYZ"
  ];

  const handleChange = (e) => {
    setInviteCode(e?.target?.value?.toUpperCase());
    setError("");
    setSuccessMessage("");
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!inviteCode?.trim()) {
      setError("Please enter an invite code");
      return;
    }

    if (inviteCode?.length < 10) {
      setError("Invite code must be at least 10 characters");
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      if (validInviteCodes?.includes(inviteCode)) {
        setSuccessMessage("Invite code verified! Redirecting to registration...");
        setTimeout(() => {
          navigate("/register", { state: { inviteCode } });
        }, 1500);
      } else {
        setError("Invalid invite code. Please check with your company administrator.");
      }
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Icon name="Building2" size={20} color="#3730a3" className="flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-indigo-900 mb-1">
              Company Invite Access
            </h3>
            <p className="text-xs text-indigo-800">
              Enter the invite code provided by your company administrator to join your organization's workspace and access team resources.
            </p>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-start gap-3">
          <Icon name="CheckCircle2" size={20} color="#059669" className="flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-emerald-800 font-medium">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Invite Code Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Company Invite Code"
          type="text"
          placeholder="COMPANY-INVITE-CODE"
          value={inviteCode}
          onChange={handleChange}
          error={error}
          description="Enter the unique invite code shared by your company"
          required
        />

        <Button
          type="submit"
          variant="default"
          fullWidth
          loading={isLoading}
          iconName="ArrowRight"
          iconPosition="right"
        >
          {isLoading ? "Verifying..." : "Verify Invite Code"}
        </Button>
      </form>

      {/* Help Section */}
      <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-lg">
        <div className="flex items-start gap-2">
          <Icon name="HelpCircle" size={18} color="#64748b" className="flex-shrink-0 mt-0.5" />
          <div className="text-xs text-slate-700">
            <p className="font-medium mb-2">Need help with your invite code?</p>
            <ul className="space-y-1 list-disc list-inside text-slate-600">
              <li>Contact your company administrator for a valid invite code</li>
              <li>Ensure you're using the most recent code provided</li>
              <li>Invite codes are case-sensitive and must be entered exactly</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Demo Codes Info */}
      <div className="mt-4 p-4 bg-primary/10 border border-primary/20 rounded-lg">
        <div className="flex items-start gap-2">
          <Icon name="Info" size={18} color="#1e40af" className="flex-shrink-0 mt-0.5" />
          <div className="text-xs text-foreground">
            <p className="font-medium mb-1">Demo Invite Codes</p>
            <div className="space-y-1 text-primary font-mono">
              <p>• TECHCORP-2025-ADMIN</p>
              <p>• DEVTEAM-INVITE-001</p>
              <p>• ENTERPRISE-ACCESS-XYZ</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyInviteSection;