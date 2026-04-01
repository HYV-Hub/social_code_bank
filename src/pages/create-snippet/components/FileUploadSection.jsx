import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const FileUploadSection = ({ files, setFiles }) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (e?.type === "dragenter" || e?.type === "dragover") {
      setDragActive(true);
    } else if (e?.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setDragActive(false);
    
    if (e?.dataTransfer?.files && e?.dataTransfer?.files?.[0]) {
      handleFiles(e?.dataTransfer?.files);
    }
  };

  const handleChange = (e) => {
    e?.preventDefault();
    if (e?.target?.files && e?.target?.files?.[0]) {
      handleFiles(e?.target?.files);
    }
  };

  const handleFiles = (fileList) => {
    const newFiles = Array.from(fileList)?.map(file => ({
      id: Date.now() + Math.random(),
      name: file?.name,
      size: file?.size,
      type: file?.type,
      file: file
    }));
    setFiles([...files, ...newFiles]);
  };

  const removeFile = (id) => {
    setFiles(files?.filter(f => f?.id !== id));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes?.[i];
  };

  const getFileIcon = (fileName) => {
    const ext = fileName?.split('.')?.pop()?.toLowerCase();
    const iconMap = {
      'js': 'FileCode',
      'jsx': 'FileCode',
      'ts': 'FileCode',
      'tsx': 'FileCode',
      'py': 'FileCode',
      'java': 'FileCode',
      'cpp': 'FileCode',
      'c': 'FileCode',
      'cs': 'FileCode',
      'go': 'FileCode',
      'rs': 'FileCode',
      'php': 'FileCode',
      'rb': 'FileCode',
      'swift': 'FileCode',
      'kt': 'FileCode',
      'json': 'FileJson',
      'xml': 'FileCode',
      'html': 'FileCode',
      'css': 'FileCode',
      'md': 'FileText',
      'txt': 'FileText',
      'pdf': 'FileText',
      'zip': 'FileArchive',
      'rar': 'FileArchive'
    };
    return iconMap?.[ext] || 'File';
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6 mb-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">Attachments</h2>
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive ? 'border-primary bg-primary/10' : 'border-border bg-muted'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-upload"
          multiple
          onChange={handleChange}
          className="hidden"
        />
        
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center">
            <Icon name="Upload" size={24} className="text-primary" />
          </div>
          
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Drop files here or click to upload
            </p>
            <p className="text-xs text-muted-foreground">
              Support for code files, documents, and archives up to 10MB
            </p>
          </div>
          
          <label htmlFor="file-upload">
            <Button variant="outline" size="sm" asChild>
              <span>Browse Files</span>
            </Button>
          </label>
        </div>
      </div>
      {files?.length > 0 && (
        <div className="mt-4 space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Uploaded Files ({files?.length})
          </h3>
          {files?.map((file) => (
            <div
              key={file?.id}
              className="flex items-center justify-between p-3 bg-muted rounded-lg border border-border"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded bg-primary/15 flex items-center justify-center flex-shrink-0">
                  <Icon name={getFileIcon(file?.name)} size={20} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-muted-foreground truncate">
                    {file?.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file?.size)}
                  </p>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                iconName="X"
                onClick={() => removeFile(file?.id)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUploadSection;