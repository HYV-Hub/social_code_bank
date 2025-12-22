import React from "react";
import Icon from "../../../components/AppIcon";

export default function MetricCard({ title, value, icon, iconColor }) {
  return (
    <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-foreground mb-2">{value || "0"}</h3>
        </div>
        <div className={`${iconColor} p-3 rounded-lg`}>
          <Icon name={icon} size={24} color="white" />
        </div>
      </div>
    </div>
  );
}