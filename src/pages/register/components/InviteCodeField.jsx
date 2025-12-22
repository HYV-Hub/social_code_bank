import React from 'react';
import Input from '../../../components/ui/Input';
import Icon from '../../../components/AppIcon';

const InviteCodeField = ({ inviteCode, setInviteCode, errors }) => {
  return (
    <div className="p-4 bg-[var(--color-muted)]/30 rounded-lg border border-[var(--color-border)]">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-4 bg-[var(--color-accent)] rounded-full" />
        <h3 className="font-semibold text-[var(--color-foreground)]">
          Team Invitation
        </h3>
      </div>
      <Input
        label="Invite Code"
        type="text"
        placeholder="Enter your company invite code"
        value={inviteCode}
        onChange={(e) => setInviteCode(e?.target?.value?.toUpperCase())}
        error={errors?.inviteCode}
        description="Ask your team lead or admin for the invite code"
        required
      />
      <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex gap-2">
          <Icon name="Info" size={16} color="var(--color-accent)" className="mt-0.5 flex-shrink-0" />
          <p className="text-xs text-[var(--color-muted-foreground)]">
            The invite code is typically sent via email when you're added to a company workspace
          </p>
        </div>
      </div>
    </div>
  );
};

export default InviteCodeField;