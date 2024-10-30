"use client"
import {
  Loader2,
  Check,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Plus,
  X,
  Github,
} from "lucide-react";

const GoogleIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="currentColor"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="currentColor"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="currentColor"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

const GithubIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C6.477 2 2 6.463 2 11.97c0 4.404 2.865 8.13 6.839 9.458.5.092.682-.216.682-.481 0-.237-.008-.866-.013-1.7-2.782.602-3.369-1.337-3.369-1.337-.454-1.151-1.11-1.458-1.11-1.458-.908-.618.069-.606.069-.606 1.003.07 1.531 1.027 1.531 1.027.892 1.524 2.341 1.084 2.91.828.092-.643.35-1.083.636-1.332-2.22-.251-4.555-1.107-4.555-4.927 0-1.088.389-1.979 1.024-2.675-.101-.252-.446-1.266.098-2.638 0 0 .837-.268 2.75 1.022A9.606 9.606 0 0112 6.82c.85.004 1.705.114 2.504.336 1.911-1.29 2.747-1.022 2.747-1.022.546 1.372.202 2.386.1 2.638.64.696 1.022 1.587 1.022 2.675 0 3.83-2.339 4.673-4.566 4.92.359.307.678.915.678 1.846 0 1.332-.012 2.407-.012 2.734 0 .267.18.577.688.48C19.137 20.098 22 16.37 22 11.969 22 6.463 17.522 2 12 2Z"
    />
  </svg>
);

const MicrosoftIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="M2.5 2.5h9v9h-9v-9Zm0 12h9v9h-9v-9Zm12 0h9v9h-9v-9Zm0-12h9v9h-9v-9Z"
    />
  </svg>
);

const AppleIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="M16.652 11.401c-.067 1.378.953 2.32 1.319 2.65-.668 1.02-1.712 1.146-2.09 1.172-1.012.09-1.969-.594-2.482-.594-.517 0-1.308.58-2.153.563-1.081-.016-2.08-.632-2.631-1.604-1.146-1.984-.298-4.907 0.81-6.516 0.544-.785 1.183-1.67 2.011-1.639 0.811.028 1.123 0.525 2.107 0.525s1.261-0.525 2.124-0.511c0.876 0.011 1.424 0.793 1.954 1.586 0.62 0.912 0.874 1.802 0.888 1.847-0.019 0.009-1.705 0.656-1.722 2.609l-0.002-0.007Z"
    />
    <path
      fill="currentColor"
      d="M14.276 7.31c0.449-0.535 0.75-1.27 0.67-2.008-0.648 0.026-1.435 0.432-1.9 0.97-0.417 0.48-0.783 1.25-0.684 1.991 0.722 0.056 1.465-0.365 1.914-0.953Z"
    />
  </svg>
);

export const Icons = {
  spinner: Loader2,
  check: Check,
  chevronDown: ChevronDown,
  chevronUp: ChevronUp,
  chevronsUpDown: ChevronsUpDown,
  plus: Plus,
  x: X,
  github: GithubIcon,
  google: GoogleIcon,
  microsoft: MicrosoftIcon,
  apple: AppleIcon,
};