/**
 * Country dropdown with flags and search. Uses Radix Popover + cmdk Command.
 * Value is ISO 3166-1 alpha-2 (e.g. "PK"). Use getCallingCodeFromCountry(value) for dial code.
 */

import { useState, useMemo } from 'react';
import { ChevronDown } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../app/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from '../../app/components/ui/command';
import { cn } from '../../app/components/ui/utils';
import { getCountryOptions, getCallingCodeFromCountry } from '../data/countries';

export type { CountryOption } from '../data/countries';
export { getCallingCodeFromCountry };

export interface CountrySelectProps {
  value: string;
  onChange: (isoCode: string) => void;
  id?: string;
  disabled?: boolean;
  'aria-invalid'?: boolean;
  'aria-describedby'?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  className?: string;
}

export function CountrySelect({
  value,
  onChange,
  id,
  disabled = false,
  'aria-invalid': ariaInvalid,
  'aria-describedby': ariaDescribedby,
  placeholder = 'Select country',
  searchPlaceholder = 'Search countries',
  className = '',
}: CountrySelectProps) {
  const [open, setOpen] = useState(false);
  const options = useMemo(() => getCountryOptions(), []);
  const selected = useMemo(
    () => options.find((c) => c.iso === value),
    [options, value]
  );

  return (
    <div
      id={id}
      className={className}
      aria-invalid={ariaInvalid}
      aria-describedby={ariaDescribedby}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            className={cn(
              'flex h-[42px] w-full items-center justify-between gap-2 rounded-lg border bg-white px-4 py-3 text-left text-sm transition-colors',
              'border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500',
              'disabled:cursor-not-allowed disabled:opacity-50',
              ariaInvalid && 'border-red-500'
            )}
          >
            <span className="flex items-center gap-2 truncate">
              {selected ? (
                <>
                  <span className="text-lg" aria-hidden>
                    {selected.flag}
                  </span>
                  <span className="truncate">
                    {selected.name} (+{selected.dialCode})
                  </span>
                </>
              ) : (
                <span className="text-gray-500">{placeholder}</span>
              )}
            </span>
            <ChevronDown
              className="h-4 w-4 shrink-0 opacity-50"
              aria-hidden
            />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          <Command>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList>
              <CommandEmpty>No country found.</CommandEmpty>
              {options.map((country) => (
                <CommandItem
                  key={country.iso}
                  value={`${country.name} ${country.iso} +${country.dialCode}`}
                  onSelect={() => {
                    onChange(country.iso);
                    setOpen(false);
                  }}
                  className="flex items-center gap-2"
                >
                  <span className="text-lg" aria-hidden>
                    {country.flag}
                  </span>
                  <span className="flex-1 truncate">{country.name}</span>
                  <span className="text-muted-foreground text-xs">
                    +{country.dialCode}
                  </span>
                </CommandItem>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
