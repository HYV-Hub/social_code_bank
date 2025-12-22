import React from 'react';

const PasswordStrengthMeter = ({ password }) => {
  const calculateStrength = (pwd) => {
    if (!pwd) return { score: 0, label: '', color: '' };
    
    let score = 0;
    if (pwd?.length >= 8) score++;
    if (pwd?.length >= 12) score++;
    if (/[a-z]/?.test(pwd) && /[A-Z]/?.test(pwd)) score++;
    if (/\d/?.test(pwd)) score++;
    if (/[^a-zA-Z0-9]/?.test(pwd)) score++;

    const levels = [
      { score: 0, label: '', color: '' },
      { score: 1, label: 'Weak', color: 'bg-red-500' },
      { score: 2, label: 'Fair', color: 'bg-orange-500' },
      { score: 3, label: 'Good', color: 'bg-yellow-500' },
      { score: 4, label: 'Strong', color: 'bg-green-500' },
      { score: 5, label: 'Very Strong', color: 'bg-emerald-600' }
    ];

    return levels?.[score];
  };

  const strength = calculateStrength(password);

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4, 5]?.map((level) => (
          <div
            key={level}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              level <= strength?.score
                ? strength?.color
                : 'bg-[var(--color-muted)]'
            }`}
          />
        ))}
      </div>
      {strength?.label && (
        <p className="text-xs text-[var(--color-muted-foreground)]">
          Password strength: <span className="font-medium">{strength?.label}</span>
        </p>
      )}
    </div>
  );
};

export default PasswordStrengthMeter;