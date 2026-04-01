import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

export default function GlobalHivesSidebar({ myHives, currentHiveId, onClose }) {
  const navigate = useNavigate();

  return (
    <div className="p-6 space-y-6 h-full overflow-y-auto">
      {/* Header for mobile */}
      <div className="flex items-center justify-between lg:hidden mb-4">
        <h2 className="text-lg font-bold text-foreground">My Hives</h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <Icon name="X" size={20} />
        </button>
      </div>

      {/* Hive Switcher */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">My Hives</h3>
        {myHives?.length > 0 ? (
          <div className="space-y-2">
            {myHives?.map((hive) => (
              <button
                key={hive?.id}
                onClick={() => navigate(`/hives/${hive?.id}`)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  currentHiveId === hive?.id
                    ? 'bg-purple-100 text-purple-900 font-semibold' :'hover:bg-muted text-foreground'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    hive?.privacy === 'private' ? 'bg-warning/100' : 'bg-success/100'
                  }`} />
                  <span className="text-sm font-medium text-foreground truncate">{hive?.name}</span>
                </div>
                <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                  {hive?.memberCount || 0}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="p-4 bg-background rounded-lg border border-border">
            <p className="text-sm text-muted-foreground text-center mb-3">No hives joined yet</p>
            <Button
              onClick={() => {
                navigate('/hives');
                onClose?.();
              }}
              variant="ghost"
              className="w-full text-sm"
            >
              Browse Hives
            </Button>
          </div>
        )}
      </div>

      {/* Global Search */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Quick Search</h3>
        <Input
          type="text"
          placeholder="Search all hives..."
          className="w-full"
          onFocus={() => {
            navigate('/hives');
            onClose?.();
          }}
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Quick Actions</h3>
        <div className="space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => {
              navigate('/hives');
              onClose?.();
            }}
          >
            <Icon name="Search" size={18} className="mr-2" />
            Browse All Hives
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => {
              navigate('/hive-creation-wizard');
              onClose?.();
            }}
          >
            <Icon name="Plus" size={18} className="mr-2" />
            Create New Hive
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => {
              navigate('/hives');
              onClose?.();
            }}
          >
            <Icon name="TrendingUp" size={18} className="mr-2" />
            Discover Popular
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      {myHives?.length > 0 && (
        <div className="pt-6 border-t border-border">
          <h3 className="text-sm font-semibold text-foreground mb-3">Your Activity</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Hives Joined</span>
              <span className="font-semibold text-foreground">{myHives?.length}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total Members</span>
              <span className="font-semibold text-foreground">
                {myHives?.reduce((sum, h) => sum + (h?.memberCount || 0), 0)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}