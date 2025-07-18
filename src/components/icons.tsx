import {
  CreditCard,
  KeyRound,
  Shield,
  FileX2,
  UserPlus,
  IndianRupee,
  type LucideProps,
} from 'lucide-react';

export const Icons = {
  logo: (props: LucideProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M4 4h16v16H4z" fill="currentColor" />
      <path d="M4 4h16v16H4z" className="text-background" stroke="none" />
      <path d="M9.93 7.5h2.25l-2.06 9h-2.25l2.06-9zM14.25 7.5h2.25l-2.06 9h-2.25l2.06-9z" fill="var(--background)" stroke="none" />
    </svg>
  ),
  login: KeyRound,
  privacy: Shield,
  crash: FileX2,
  upi: IndianRupee,
  creditCard: CreditCard,
  registration: UserPlus,
};

export type IconKey = keyof Omit<typeof Icons, 'logo'>;
