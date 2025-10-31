import React from 'react';

export default function PasswordStrength({ password }) {
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { level: 0, label: '', color: '' };
    
    let strength = 0;
    if (pwd.length >= 6) strength++;
    if (pwd.length >= 8) strength++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/[!@#$%^&*]/.test(pwd)) strength++;

    if (strength <= 1) return { level: 1, label: 'Weak', color: '#ef4444' };
    if (strength <= 2) return { level: 2, label: 'Fair', color: '#f59e0b' };
    if (strength <= 3) return { level: 3, label: 'Good', color: '#10b981' };
    if (strength <= 4) return { level: 4, label: 'Strong', color: '#06b6d4' };
    return { level: 5, label: 'Very Strong', color: '#8b5cf6' };
  };

  const strength = getPasswordStrength(password);

  if (!password) return null;

  return (
    <div className="password-strength">
      <div className="strength-bars">
        {[1, 2, 3, 4, 5].map((bar) => (
          <div
            key={bar}
            className="strength-bar"
            style={{
              backgroundColor: bar <= strength.level ? strength.color : '#e2e8f0',
            }}
          />
        ))}
      </div>
      <span className="strength-label" style={{ color: strength.color }}>
        {strength.label}
      </span>
    </div>
  );
}