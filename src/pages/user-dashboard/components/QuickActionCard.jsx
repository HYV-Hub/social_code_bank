import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const QuickActionCard = ({ icon, title, description, buttonText, onClick, variant = "default" }) => {
  return (
    <div className="bg-card rounded-lg border border-border p-6 hover:shadow-lg transition-all">
      <div className="flex flex-col items-center text-center">
        <div className={`p-4 rounded-full mb-4 ${
          variant === 'primary' ? 'bg-primary/10' : 'bg-accent/10'
        }`}>
          <Icon 
            name={icon} 
            size={32} 
            color={variant === 'primary' ? 'var(--color-primary)' : 'var(--color-accent)'} 
          />
        </div>
        
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {title}
        </h3>
        
        <p className="text-sm text-muted-foreground mb-6">
          {description}
        </p>
        
        <Button
          variant={variant === 'primary' ? 'default' : 'outline'}
          fullWidth
          iconName="Plus"
          iconPosition="left"
          onClick={onClick}
        >
          {buttonText}
        </Button>
      </div>
    </div>
  );
};

export default QuickActionCard;