import { useEffect, useRef, useState } from 'react';
import { geocodeSuggest } from '../../services/map.service';
import type { GeocodeSuggestion } from '../../types';
import { Input } from '../ui/Input';
import { Icon } from '../ui/Icon';

export interface PlaceSearchInputProps {
  onSelect: (result: GeocodeSuggestion) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function PlaceSearchInput({
  onSelect,
  disabled,
  placeholder = 'Search coordinates or place name…',
}: PlaceSearchInputProps): JSX.Element {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeocodeSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }

    debounceRef.current = setTimeout(() => {
      setLoading(true);
      void geocodeSuggest(q)
        .then((items) => {
          setResults(items);
          setOpen(items.length > 0);
        })
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 350);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const pick = (item: GeocodeSuggestion): void => {
    setQuery(item.label);
    setOpen(false);
    onSelect(item);
  };

  return (
    <div className="relative">
      <Input
        label="Locate on map"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        disabled={disabled}
        iconLeft={<Icon name="search" className="text-base" />}
      />
      {loading && (
        <span className="absolute right-3 top-9 font-data-sm text-[10px] text-on-surface-variant">
          SCANNING…
        </span>
      )}
      {open && results.length > 0 && (
        <ul className="absolute z-50 mt-xs w-full max-h-40 overflow-y-auto rounded-lg border border-outline-variant/40 bg-surface-container-high shadow-lg">
          {results.map((r, i) => (
            <li key={`${r.lat}-${r.lon}-${i}`}>
              <button
                type="button"
                className="w-full text-left px-md py-sm font-data-sm text-[11px] text-on-surface hover:bg-primary/10 border-b border-outline-variant/10 last:border-0"
                onClick={() => pick(r)}
              >
                <span className="text-secondary-container block truncate">{r.label}</span>
                <span className="text-on-surface-variant text-[10px]">
                  {r.lat.toFixed(5)}, {r.lon.toFixed(5)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {query.trim().length >= 2 && !loading && results.length === 0 && open && (
        <p className="mt-xs font-data-sm text-[10px] text-on-surface-variant">
          No matches — drag the pin on the map to set coordinates manually.
        </p>
      )}
    </div>
  );
}
