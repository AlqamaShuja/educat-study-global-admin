import React, { useState, useRef, useEffect, useCallback } from "react";
import { Search, X, Filter, Clock, User, Hash, Calendar } from "lucide-react";

const SearchInput = ({
  value = "",
  onChange,
  onSearch,
  onClear,
  placeholder = "Search...",
  showFilters = false,
  filters = {},
  onFiltersChange,
  debounceMs = 300,
  disabled = false,
  autoFocus = false,
  suggestions = [],
  showSuggestions = false,
  onSuggestionSelect,
  recentSearches = [],
  showRecentSearches = true,
  className = "",
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showSuggestionsList, setShowSuggestionsList] = useState(false);

  const inputRef = useRef(null);
  const debounceRef = useRef(null);
  const suggestionRefs = useRef([]);

  // Debounced search
  const debouncedSearch = useCallback(
    (searchValue) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        if (onSearch) {
          onSearch(searchValue, filters);
        }
      }, debounceMs);
    },
    [onSearch, filters, debounceMs]
  );

  // Handle input change
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    onChange(newValue);

    if (newValue.trim()) {
      debouncedSearch(newValue);
      setShowSuggestionsList(true);
    } else {
      setShowSuggestionsList(false);
    }
  };

  // Handle clear
  const handleClear = () => {
    onChange("");
    setShowSuggestionsList(false);
    if (onClear) {
      onClear();
    }
    inputRef.current?.focus();
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion) => {
    onChange(suggestion);
    setShowSuggestionsList(false);
    if (onSuggestionSelect) {
      onSuggestionSelect(suggestion);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setShowSuggestionsList(false);
      inputRef.current?.blur();
    } else if (e.key === "Enter" && value.trim()) {
      setShowSuggestionsList(false);
      if (onSearch) {
        onSearch(value, filters);
      }
    }
  };

  // Auto focus
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Cleanup debounce
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // Filter options
  const filterOptions = [
    {
      key: "type",
      label: "Message Type",
      icon: Hash,
      options: [
        { value: "text", label: "Text Messages" },
        { value: "image", label: "Images" },
        { value: "video", label: "Videos" },
        { value: "file", label: "Files" },
        { value: "audio", label: "Audio" },
      ],
    },
    {
      key: "dateRange",
      label: "Date Range",
      icon: Calendar,
      options: [
        { value: "today", label: "Today" },
        { value: "week", label: "This Week" },
        { value: "month", label: "This Month" },
        { value: "custom", label: "Custom Range" },
      ],
    },
    {
      key: "sender",
      label: "Sender",
      icon: User,
      options: [], // Will be populated with conversation participants
    },
  ];

  // Combined suggestions (recent searches + suggestions)
  const combinedSuggestions = [
    ...(showRecentSearches && value.length === 0 ? recentSearches : []),
    ...(suggestions || []),
  ].filter((item, index, arr) => arr.indexOf(item) === index); // Remove duplicates

  return (
    <div className={`relative ${className}`}>
      {/* Main Search Input */}
      <div
        className={`
        relative flex items-center bg-white border rounded-lg transition-all duration-200
        ${
          isFocused
            ? "border-blue-500 shadow-lg ring-1 ring-blue-500/20"
            : "border-gray-300"
        }
        ${disabled ? "opacity-50 cursor-not-allowed bg-gray-50" : ""}
      `}
      >
        {/* Search Icon */}
        <div className="absolute left-3 text-gray-400">
          <Search className="w-5 h-5" />
        </div>

        {/* Input Field */}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            setIsFocused(true);
            if (value.length === 0 && showRecentSearches) {
              setShowSuggestionsList(true);
            }
          }}
          onBlur={() => {
            setIsFocused(false);
            // Delay hiding suggestions to allow for clicks
            setTimeout(() => setShowSuggestionsList(false), 150);
          }}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full pl-10 pr-20 py-3 bg-transparent border-0 outline-0 placeholder-gray-400 text-gray-900"
        />

        {/* Action Buttons */}
        <div className="absolute right-2 flex items-center space-x-1">
          {/* Clear Button */}
          {value && (
            <button
              onClick={handleClear}
              className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Filter Button */}
          {showFilters && (
            <button
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className={`
                p-1.5 rounded transition-colors
                ${
                  showFilterMenu || Object.keys(filters).length > 0
                    ? "bg-blue-100 text-blue-600"
                    : "text-gray-400 hover:text-gray-600"
                }
              `}
            >
              <Filter className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Active Filters Display */}
      {Object.keys(filters).length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {Object.entries(filters).map(([key, value]) => (
            <div
              key={key}
              className="flex items-center space-x-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm"
            >
              <span>
                {key}: {value}
              </span>
              <button
                onClick={() => {
                  const newFilters = { ...filters };
                  delete newFilters[key];
                  onFiltersChange?.(newFilters);
                }}
                className="text-blue-500 hover:text-blue-700"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Suggestions Dropdown */}
      {(showSuggestions || showRecentSearches) &&
        showSuggestionsList &&
        combinedSuggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-64 overflow-y-auto">
            {/* Recent Searches */}
            {value.length === 0 && recentSearches.length > 0 && (
              <div>
                <div className="px-3 py-2 text-xs font-medium text-gray-500 border-b">
                  Recent Searches
                </div>
                {recentSearches.map((search, index) => (
                  <button
                    key={`recent-${index}`}
                    onClick={() => handleSuggestionSelect(search)}
                    className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-gray-50 transition-colors"
                  >
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700">{search}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div>
                {value.length === 0 && recentSearches.length > 0 && (
                  <div className="px-3 py-2 text-xs font-medium text-gray-500 border-b">
                    Suggestions
                  </div>
                )}
                {suggestions.map((suggestion, index) => (
                  <button
                    key={`suggestion-${index}`}
                    onClick={() => handleSuggestionSelect(suggestion)}
                    className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-gray-50 transition-colors"
                  >
                    <Search className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700">{suggestion}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

      {/* Filter Menu */}
      {showFilters && showFilterMenu && (
        <div className="absolute top-full right-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
          <div className="p-3">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-900">Filters</h3>
              <button
                onClick={() => setShowFilterMenu(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {filterOptions.map((filterGroup) => {
                const Icon = filterGroup.icon;
                return (
                  <div key={filterGroup.key}>
                    <div className="flex items-center space-x-2 mb-2">
                      <Icon className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">
                        {filterGroup.label}
                      </span>
                    </div>

                    <div className="space-y-1 ml-6">
                      {filterGroup.options.map((option) => (
                        <label key={option.value} className="flex items-center">
                          <input
                            type="radio"
                            name={filterGroup.key}
                            value={option.value}
                            checked={filters[filterGroup.key] === option.value}
                            onChange={(e) => {
                              if (onFiltersChange) {
                                onFiltersChange({
                                  ...filters,
                                  [filterGroup.key]: e.target.value,
                                });
                              }
                            }}
                            className="mr-2 text-blue-600"
                          />
                          <span className="text-sm text-gray-600">
                            {option.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Clear Filters */}
            {Object.keys(filters).length > 0 && (
              <div className="mt-4 pt-3 border-t">
                <button
                  onClick={() => {
                    onFiltersChange?.({});
                    setShowFilterMenu(false);
                  }}
                  className="w-full px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Compact search input for mobile/small spaces
export const CompactSearchInput = ({
  value,
  onChange,
  onSearch,
  placeholder = "Search...",
  className = "",
}) => (
  <div className={`relative ${className}`}>
    <div className="relative flex items-center bg-gray-100 rounded-full">
      <Search className="absolute left-3 w-4 h-4 text-gray-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={(e) => {
          if (e.key === "Enter" && onSearch) {
            onSearch(value);
          }
        }}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2 bg-transparent border-0 outline-0 placeholder-gray-400 text-gray-900"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-3 text-gray-400 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  </div>
);

// Global search bar with keyboard shortcut
export const GlobalSearchBar = ({
  value,
  onChange,
  onSearch,
  shortcutKey = "/",
  className = "",
}) => {
  const inputRef = useRef(null);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === shortcutKey && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const activeElement = document.activeElement;
        const isInputFocused =
          activeElement?.tagName === "INPUT" ||
          activeElement?.tagName === "TEXTAREA" ||
          activeElement?.contentEditable === "true";

        if (!isInputFocused) {
          e.preventDefault();
          inputRef.current?.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [shortcutKey]);

  return (
    <div className={`relative ${className}`}>
      <SearchInput
        ref={inputRef}
        value={value}
        onChange={onChange}
        onSearch={onSearch}
        placeholder={`Search... (Press "${shortcutKey}" to focus)`}
        autoFocus={false}
      />
    </div>
  );
};

export default SearchInput;
