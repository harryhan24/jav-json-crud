export interface ThemeData {
  version: number;
  themeList: Theme[];
}

export interface Theme {
  theme: string;
  list: string[];
}

export const CODE_PATTERNS: ReadonlyArray<RegExp> = [
  /([A-Z]{2,5})-?(\d{2,5})/,   // ABC-1234, ABC1234
  /([A-Z]{2,5})[-_](\d{2,5})/, // ABC_1234 or ABC-1234
  /([A-Z]{2,5})(\d{2,5})/,     // ABC1234
] as const;

export function validateCode(code: string): boolean {
  return CODE_PATTERNS.some(pattern => pattern.test(code.trim()));
}
