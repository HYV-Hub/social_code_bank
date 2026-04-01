import React from 'react';


const CompanyCreationFields = ({ 
  companyName, 
  setCompanyName, 
  companySlug,
  setCompanySlug,
  companyWebsite,
  setCompanyWebsite,
  companyDescription,
  setCompanyDescription,
  errors 
}) => {
  // Auto-generate slug from company name
  const handleCompanyNameChange = (value) => {
    setCompanyName(value);
    
    // Auto-generate slug if not manually edited
    if (!companySlug || companySlug === generateSlug(companyName)) {
      const newSlug = generateSlug(value);
      setCompanySlug(newSlug);
    }
  };

  const generateSlug = (name) => {
    return name
      ?.toLowerCase()
      ?.trim()
      ?.replace(/[^a-z0-9]+/g, '-')
      ?.replace(/^-+|-+$/g, '') || '';
  };

  return (
    <div className="space-y-4 p-6 bg-primary/10 rounded-lg border border-primary/20">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-1 h-5 bg-primary rounded-full" />
        <h3 className="font-semibold text-slate-800 text-lg">
          Company Information
        </h3>
      </div>
      
      <div>
        <label htmlFor="companyName" className="block text-sm font-medium text-slate-700 mb-2">
          Company Name <span className="text-error">*</span>
        </label>
        <input
          type="text"
          id="companyName"
          value={companyName}
          onChange={(e) => handleCompanyNameChange(e?.target?.value)}
          placeholder="Enter your company name"
          className="w-full px-4 py-3 bg-card border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          required
        />
        {errors?.companyName && (
          <p className="text-sm text-error mt-1">{errors?.companyName}</p>
        )}
      </div>

      <div>
        <label htmlFor="companySlug" className="block text-sm font-medium text-slate-700 mb-2">
          Company Slug <span className="text-error">*</span>
        </label>
        <input
          type="text"
          id="companySlug"
          value={companySlug}
          onChange={(e) => setCompanySlug(generateSlug(e?.target?.value))}
          placeholder="company-slug"
          className="w-full px-4 py-3 bg-card border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          required
        />
        <p className="mt-1 text-xs text-slate-500">
          Used in company URL: hyvhub.com/company/{companySlug || 'your-slug'}
        </p>
        {errors?.companySlug && (
          <p className="text-sm text-error mt-1">{errors?.companySlug}</p>
        )}
      </div>

      <div>
        <label htmlFor="companyWebsite" className="block text-sm font-medium text-slate-700 mb-2">
          Company Website
        </label>
        <input
          type="url"
          id="companyWebsite"
          value={companyWebsite}
          onChange={(e) => setCompanyWebsite(e?.target?.value)}
          placeholder="https://www.example.com"
          className="w-full px-4 py-3 bg-card border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
        />
        <p className="mt-1 text-xs text-slate-500">Optional - Your company's website URL</p>
        {errors?.companyWebsite && (
          <p className="text-sm text-error mt-1">{errors?.companyWebsite}</p>
        )}
      </div>

      <div>
        <label htmlFor="companyDescription" className="block text-sm font-medium text-slate-700 mb-2">
          Company Description
        </label>
        <textarea
          id="companyDescription"
          value={companyDescription}
          onChange={(e) => setCompanyDescription(e?.target?.value)}
          rows={3}
          placeholder="Brief description of your company..."
          className="w-full px-4 py-3 bg-card border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
        />
        <p className="mt-1 text-xs text-slate-500">Optional - Tell others about your company</p>
        {errors?.companyDescription && (
          <p className="text-sm text-error mt-1">{errors?.companyDescription}</p>
        )}
      </div>
    </div>
  );
};

export default CompanyCreationFields;