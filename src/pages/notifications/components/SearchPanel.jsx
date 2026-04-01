import React, { useState } from 'react';
import { Search, Calendar, X } from 'lucide-react';

export function SearchPanel({ onSearch, onDateRangeChange }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleSearch = (e) => {
    e?.preventDefault();
    onSearch(searchTerm);
  };

  const handleDateRangeApply = () => {
    if (startDate && endDate) {
      onDateRangeChange({ start: startDate, end: endDate });
    }
  };

  const handleClearDates = () => {
    setStartDate('');
    setEndDate('');
    onDateRangeChange(null);
  };

  return (
    <div className="bg-card border-b border-border p-6 space-y-4">
      {/* Search Input */}
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e?.target?.value)}
            placeholder="Search notifications by user, content, or type..."
            className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
          />
        </div>
        <button
          type="submit"
          className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary transition-colors whitespace-nowrap"
        >
          Search
        </button>
      </form>
      {/* Date Range Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <Calendar className="w-5 h-5 text-muted-foreground shrink-0" />
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e?.target?.value)}
            className="px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
          />
          <span className="text-muted-foreground text-center sm:text-left">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e?.target?.value)}
            className="px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
          />
          <div className="flex items-center gap-2">
            <button
              onClick={handleDateRangeApply}
              disabled={!startDate || !endDate}
              className="flex-1 sm:flex-initial px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              Apply
            </button>
            {(startDate || endDate) && (
              <button
                onClick={handleClearDates}
                className="p-2 text-muted-foreground hover:text-muted-foreground hover:bg-muted rounded-lg transition-colors"
                title="Clear date range"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}