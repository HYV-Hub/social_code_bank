import React, { useState } from 'react';
import { Upload, FileCode, CheckCircle, XCircle, Loader, Download, Play } from 'lucide-react';

const BatchProcessor = () => {
  const [files, setFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState(null);

  const mockResults = [
    {
      id: 1,
      filename: 'UserProfile.jsx',
      status: 'success',
      score: 78,
      issues: 5,
      fixable: 4
    },
    {
      id: 2,
      filename: 'Dashboard.jsx',
      status: 'success',
      score: 82,
      issues: 3,
      fixable: 3
    },
    {
      id: 3,
      filename: 'AuthService.js',
      status: 'warning',
      score: 65,
      issues: 8,
      fixable: 5
    },
    {
      id: 4,
      filename: 'api-utils.js',
      status: 'success',
      score: 91,
      issues: 1,
      fixable: 1
    }
  ];

  const handleFileUpload = (e) => {
    const uploadedFiles = Array.from(e?.target?.files || []);
    setFiles(uploadedFiles);
  };

  const handleProcess = () => {
    setProcessing(true);
    // Simulate processing
    setTimeout(() => {
      setResults(mockResults);
      setProcessing(false);
    }, 3000);
  };

  const handleApplyAllFixes = () => {
    console.log('Applying all automatic fixes');
    // Implementation would apply fixes to all files
  };

  const handleExportReport = () => {
    console.log('Exporting batch analysis report');
    // Implementation would generate and download report
  };

  const getStatusConfig = (status) => {
    const configs = {
      success: {
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        icon: CheckCircle
      },
      warning: {
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        icon: XCircle
      },
      error: {
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        icon: XCircle
      }
    };
    return configs?.[status] || configs?.success;
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <h3 className="text-xl font-semibold text-slate-900 mb-6">
          Batch Style Analysis
        </h3>
        
        <div className="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center hover:border-blue-500 transition-colors">
          <input
            type="file"
            multiple
            accept=".js,.jsx,.ts,.tsx"
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer flex flex-col items-center gap-4"
          >
            <div className="p-4 bg-blue-50 rounded-full">
              <Upload className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <p className="text-lg font-medium text-slate-900 mb-1">
                Click to upload or drag and drop
              </p>
              <p className="text-sm text-slate-600">
                JavaScript, TypeScript, JSX, or TSX files
              </p>
            </div>
          </label>
        </div>

        {/* Selected Files */}
        {files?.length > 0 && (
          <div className="mt-6 space-y-3">
            <h4 className="font-medium text-slate-900">
              Selected Files ({files?.length})
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {files?.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200"
                >
                  <FileCode className="w-5 h-5 text-blue-600" />
                  <span className="flex-1 text-sm text-slate-700">{file?.name}</span>
                  <span className="text-xs text-slate-500">
                    {(file?.size / 1024)?.toFixed(2)} KB
                  </span>
                </div>
              ))}
            </div>
            
            <button
              onClick={handleProcess}
              disabled={processing}
              className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Processing Files...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Analyze All Files
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Results Section */}
      {results && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="text-3xl font-bold text-slate-900">{results?.length}</div>
              <div className="text-sm text-slate-600 mt-1">Files Analyzed</div>
            </div>
            <div className="bg-green-50 rounded-xl border border-green-200 p-6">
              <div className="text-3xl font-bold text-green-600">
                {Math.round(
                  results?.reduce((sum, r) => sum + r?.score, 0) / results?.length
                )}%
              </div>
              <div className="text-sm text-green-700 mt-1">Average Score</div>
            </div>
            <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-6">
              <div className="text-3xl font-bold text-yellow-600">
                {results?.reduce((sum, r) => sum + r?.issues, 0)}
              </div>
              <div className="text-sm text-yellow-700 mt-1">Total Issues</div>
            </div>
            <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
              <div className="text-3xl font-bold text-blue-600">
                {results?.reduce((sum, r) => sum + r?.fixable, 0)}
              </div>
              <div className="text-sm text-blue-700 mt-1">Auto-Fixable</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-slate-900">Batch Actions</h4>
                <p className="text-sm text-slate-600 mt-1">
                  Apply fixes or export detailed report
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleExportReport}
                  className="px-6 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-2 font-medium"
                >
                  <Download className="w-4 h-4" />
                  Export Report
                </button>
                <button
                  onClick={handleApplyAllFixes}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center gap-2 font-medium"
                >
                  <CheckCircle className="w-4 h-4" />
                  Apply All Fixes
                </button>
              </div>
            </div>
          </div>

          {/* Results Table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                      File
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                      Score
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                      Issues
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                      Auto-Fixable
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {results?.map((result) => {
                    const statusConfig = getStatusConfig(result?.status);
                    const StatusIcon = statusConfig?.icon;

                    return (
                      <tr key={result?.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <FileCode className="w-5 h-5 text-slate-400" />
                            <span className="font-medium text-slate-900">
                              {result?.filename}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <StatusIcon className={`w-5 h-5 ${statusConfig?.color}`} />
                            <span className={`text-sm font-medium ${statusConfig?.color}`}>
                              {result?.status?.charAt(0)?.toUpperCase() + result?.status?.slice(1)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="text-lg font-bold text-slate-900">
                              {result?.score}%
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium">
                            {result?.issues}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                            {result?.fixable}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                            View Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BatchProcessor;