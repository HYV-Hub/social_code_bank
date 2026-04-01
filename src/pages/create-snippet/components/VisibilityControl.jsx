import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';
import Icon from '../../../components/AppIcon';
import { useSearchParams, useLocation } from 'react-router-dom';

const VisibilityControl = ({ visibility, setVisibility, team, setTeam }) => {
  const { userProfile } = useAuth();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const teamIdFromUrl = searchParams?.get('team');
  const hiveIdFromUrl = searchParams?.get('hive'); // NEW: Detect hive context
  const [teams, setTeams] = useState([]);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [hiveName, setHiveName] = useState(''); // NEW: Store hive name for display

  // CRITICAL FIX: Detect context from navigation state
  const isCompanyContext = location?.state?.companyId && location?.state?.defaultVisibility === 'company';
  const isTeamContext = teamIdFromUrl || location?.state?.defaultVisibility === 'team';
  const isHiveContext = hiveIdFromUrl; // NEW: Hive context detection

  // NEW: Load hive details when in hive context
  useEffect(() => {
    const loadHiveDetails = async () => {
      if (hiveIdFromUrl) {
        try {
          const { data, error } = await supabase
            ?.from('hives')
            ?.select('name')
            ?.eq('id', hiveIdFromUrl)
            ?.single();
          
          if (error) throw error;
          setHiveName(data?.name || 'Hive');
        } catch (err) {
          console.error('Error loading hive details:', err);
          setHiveName('Hive');
        }
      }
    };

    loadHiveDetails();
  }, [hiveIdFromUrl]);

  useEffect(() => {
    if (userProfile?.company_id || teamIdFromUrl) {
      loadTeams();
    }
  }, [userProfile, teamIdFromUrl]);

  const loadTeams = async () => {
    try {
      setLoadingTeams(true);
      let query = supabase?.from('teams')?.select('id, name, description')?.order('name');

      if (userProfile?.company_id) {
        query = query?.eq('company_id', userProfile?.company_id);
      }

      const { data, error } = await query;
      if (error) throw error;
      setTeams(data || []);
    } catch (err) {
      console.error('Error loading teams:', err);
    } finally {
      setLoadingTeams(false);
    }
  };

  // CRITICAL FIX: Determine available visibility options based on context
  const getVisibilityOptions = () => {
    // NEW: If in hive context, return empty array (no visibility options needed)
    if (isHiveContext) {
      return [];
    }

    if (isTeamContext) {
      // On team page: only team and private
      return [
        { value: 'team', label: 'Team Only', icon: 'Users', description: 'Visible to team members' },
        { value: 'private', label: 'Private', icon: 'Lock', description: 'Only you can see this' }
      ];
    }
    
    if (isCompanyContext) {
      // On company page: only company (no private option)
      return [
        { value: 'company', label: 'Company', icon: 'Building', description: 'Visible to all company members' }
      ];
    }

    // Default (global dashboard): all options
    return [
      { value: 'public', label: 'Public', icon: 'Globe', description: 'Anyone can see this' },
      { value: 'private', label: 'Private', icon: 'Lock', description: 'Only you can see this' },
      ...(userProfile?.company_id ? [
        { value: 'company', label: 'Company', icon: 'Building', description: 'Visible to company members' }
      ] : [])
    ];
  };

  const visibilityOptions = getVisibilityOptions();

  // NEW: If in hive context, show hive indicator instead of visibility controls
  if (isHiveContext) {
    return (
      <div className="bg-card rounded-lg shadow-sm border border-border p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Posting to Hive</h2>
        
        <div className="p-4 bg-primary/10 rounded-lg flex items-start gap-3 border-2 border-border">
          <Icon name="Layers" size={20} className="text-primary flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-semibold text-primary">{hiveName}</span>
              <span className="px-2 py-0.5 bg-primary/15 text-primary text-xs rounded-full font-medium">
                Hive
              </span>
            </div>
            <p className="text-sm text-primary">
              This snippet will be automatically added to the <strong>{hiveName}</strong> hive and visible to all hive members.
            </p>
          </div>
        </div>

        <div className="mt-4 p-3 bg-primary/10 rounded-lg flex items-start gap-2">
          <Icon name="Info" size={16} className="text-primary flex-shrink-0 mt-0.5" />
          <p className="text-xs text-foreground">
            Hive snippets are shared with all members of this hive. No additional visibility settings needed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg shadow-sm border border-border p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">Visibility & Sharing</h2>
      
      {/* FIXED: Context-aware visibility options */}
      <div className="space-y-3 mb-4">
        {visibilityOptions?.map((option) => (
          <label
            key={option?.value}
            className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
              visibility === option?.value
                ? 'border-primary bg-primary/10' :'border-border hover:border-border'
            }`}
          >
            <input
              type="radio"
              name="visibility"
              value={option?.value}
              checked={visibility === option?.value}
              onChange={(e) => {
                setVisibility(e?.target?.value);
                if (e?.target?.value !== 'team') {
                  setTeam('');
                }
              }}
              className="mt-1"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Icon name={option?.icon} size={18} className={visibility === option?.value ? 'text-primary' : 'text-muted-foreground'} />
                <span className="font-medium text-foreground">{option?.label}</span>
              </div>
              <p className="text-sm text-muted-foreground">{option?.description}</p>
            </div>
          </label>
        ))}
      </div>

      {/* FIXED: Team selection - show when:
          1. Company context AND user wants to post to specific team
          2. Team context (automatically selected)
          3. Global context with visibility=company (option to specify team)
      */}
      {(visibility === 'company' || visibility === 'team') && teams?.length > 0 && (
        <div className="mt-4">
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            {isTeamContext ? 'Team' : 'Assign to Team (Optional)'}
          </label>
          <div className="flex items-center gap-3">
            <Icon name="Users" className="text-muted-foreground" />
            <select
              value={team}
              onChange={(e) => {
                setTeam(e?.target?.value);
                // If team is selected in company context, change visibility to team
                if (e?.target?.value && visibility === 'company') {
                  setVisibility('team');
                }
              }}
              disabled={loadingTeams}
              className="flex-1 px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-primary"
            >
              <option value="">
                {isTeamContext ? 'Select team' : 'No specific team (Company-wide)'}
              </option>
              {teams?.map(t => (
                <option key={t?.id} value={t?.id}>
                  {t?.name}
                </option>
              ))}
            </select>
          </div>
          {isCompanyContext && team && (
            <p className="mt-2 text-xs text-primary">
              This will post to the selected team instead of company-wide
            </p>
          )}
        </div>
      )}

      {/* Context indicator */}
      {isCompanyContext && (
        <div className="mt-4 p-3 bg-primary/10 rounded-lg flex items-start gap-2">
          <Icon name="Info" size={16} className="text-primary flex-shrink-0 mt-0.5" />
          <p className="text-xs text-foreground">
            This snippet will be posted to your company feed. Select a team above to post to a specific team instead.
          </p>
        </div>
      )}

      {isTeamContext && (
        <div className="mt-4 p-3 bg-primary/10 rounded-lg flex items-start gap-2">
          <Icon name="Info" size={16} className="text-primary flex-shrink-0 mt-0.5" />
          <p className="text-xs text-primary">
            This snippet will be automatically posted to the team feed.
          </p>
        </div>
      )}
    </div>
  );
};

export default VisibilityControl;