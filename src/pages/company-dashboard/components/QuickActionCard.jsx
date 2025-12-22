import React from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../../../components/AppIcon";
import Button from "../../../components/ui/Button";

export default function QuickActionCard({ title, description, icon, iconColor, actionLabel, onAction, stats }) {
  const navigate = useNavigate();

  const handleAction = () => {
    // Prevent state conflicts by using direct navigation
    if (title === "Bug Board") {
      // Use replace to avoid state conflicts
      navigate("/bug-board", { replace: true });
    } else if (title === "Create Snippet") {
      navigate("/create-snippet", { replace: true });
    } else if (onAction) {
      onAction();
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 hover:border-primary transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className={`${iconColor} p-3 rounded-lg`}>
          <Icon name={icon} size={24} color="white" />
        </div>
      </div>

      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4">{description}</p>

      <Button variant="outline" size="sm" fullWidth onClick={handleAction}>
        {actionLabel}
      </Button>
    </div>
  );
}