// @ts-nocheck
import { countryFlag, countryTone } from "../../utils/function";

/**
 * Small origin chip (KR / JP / CN …).
 * Text rather than a flag emoji so it renders on every platform.
 */
const CountryBadge = ({ code, className = "" }) => {
  const label = countryFlag(code);
  if (!label) return null;
  return (
    <span
      className={`px-1 py-px rounded border text-[8px] font-black leading-none tracking-wide ${countryTone(
        code
      )} ${className}`}
    >
      {label}
    </span>
  );
};

export default CountryBadge;
