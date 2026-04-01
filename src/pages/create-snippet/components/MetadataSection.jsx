import React from 'react';
import Input from '../../../components/ui/Input';

const MetadataSection = ({ 
  title, 
  setTitle, 
  description, 
  setDescription,
  tags, 
  setTags,
  errors 
}) => {
  // REMOVED: language and setLanguage props - AI will auto-detect language
  
  return (
    <div className="bg-card rounded-lg border border-border p-6 mb-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">Snippet Information</h2>
      <div className="space-y-4">
        <Input
          label="Title"
          type="text"
          placeholder="Enter a descriptive title for your snippet"
          value={title}
          onChange={(e) => setTitle(e?.target?.value)}
          error={errors?.title}
          required
        />

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Description
          </label>
          <textarea
            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
            rows="3"
            placeholder="Describe what this snippet does and how to use it"
            value={description}
            onChange={(e) => setDescription(e?.target?.value)}
          />
          {errors?.description && (
            <p className="mt-1 text-sm text-error">{errors?.description}</p>
          )}
        </div>

        {/* REMOVED: Language selector - AI will automatically detect language from code */}
        
        {/* Tags field - AI-suggested with language auto-detection */}
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Tags <span className="text-muted-foreground text-xs">(AI will suggest tags and detect language automatically)</span>
          </label>
          <Input
            type="text"
            placeholder="AI will automatically tag your snippet and detect the programming language"
            value={tags}
            onChange={(e) => setTags(e?.target?.value)}
            description="You can also add custom tags, separated by commas. Click 'Analyze with AI' to auto-detect language."
          />
        </div>
      </div>
    </div>
  );
};

export default MetadataSection;