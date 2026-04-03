import { Search } from 'lucide-react';

export interface SearchBoxOption {
  value: string;
  label: string;
}

interface SearchBoxProps {
  /** Placeholder for the main search input. */
  searchPlaceholder?: string;
  /** Options for type filter (e.g. Sale, Rent, Services). */
  typeOptions?: SearchBoxOption[];
  /** Options for city filter. */
  cityOptions?: SearchBoxOption[];
  /** Initial form values when the search box is used on a results page. */
  initialQuery?: string;
  initialType?: string;
  initialCity?: string;
  /** Label for the submit button. */
  submitLabel?: string;
  /** Callback when user submits search (optional). */
  onSearch?: (params: { query: string; type: string; city: string }) => void;
}

const defaultTypeOptions: SearchBoxOption[] = [
  { value: '', label: 'All Types' },
];

export function SearchBox({
  searchPlaceholder = 'What are you looking for?',
  typeOptions = defaultTypeOptions,
  cityOptions = [],
  initialQuery = '',
  initialType = '',
  initialCity = '',
  submitLabel = 'Search',
  onSearch,
}: SearchBoxProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const query = (form.querySelector('[name="search-query"]') as HTMLInputElement)?.value ?? '';
    const type = (form.querySelector('[name="search-type"]') as HTMLSelectElement)?.value ?? '';
    const city = (form.querySelector('[name="search-city"]') as HTMLSelectElement)?.value ?? '';
    onSearch?.({ query, type, city });
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-4">
          <input
            type="text"
            name="search-query"
            defaultValue={initialQuery}
            placeholder={searchPlaceholder}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            aria-label="Search query"
          />
        </div>
        <div className="md:col-span-2">
          <select
            name="search-type"
            defaultValue={initialType}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            aria-label="Listing type"
          >
            {typeOptions.map((opt) => (
              <option key={opt.value || 'any'} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <select
            name="search-city"
            defaultValue={initialCity}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            aria-label="City"
          >
            <option value="">Select City</option>
            {cityOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-4">
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-pink-600 to-rose-600 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-shadow flex items-center justify-center gap-2"
          >
            <Search className="w-5 h-5" aria-hidden />
            {submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
}
