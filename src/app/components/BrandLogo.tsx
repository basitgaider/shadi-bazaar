import type { ImgHTMLAttributes } from 'react';

type BrandLogoProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'>;

export function BrandLogo({ className, alt = 'ShadiBazar logo', ...rest }: BrandLogoProps) {
  return <img src="/brand-logo.svg" alt={alt} className={className} {...rest} />;
}
