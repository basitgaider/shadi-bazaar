import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export interface PasswordInputProps
  extends Omit<React.ComponentPropsWithoutRef<'input'>, 'type'> {
  /** Input type is controlled by visibility toggle; do not pass type. */
  type?: never;
}

export function PasswordInput({ className = '', ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        {...props}
        type={visible ? 'text' : 'password'}
        className={`w-full pr-11 ${className}`.trim()}
        aria-label={props['aria-label'] ?? undefined}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-0"
        aria-label={visible ? 'Hide password' : 'Show password'}
      >
        {visible ? (
          <EyeOff className="w-5 h-5" aria-hidden />
        ) : (
          <Eye className="w-5 h-5" aria-hidden />
        )}
      </button>
    </div>
  );
}
