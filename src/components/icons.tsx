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
      viewBox="0 0 256 256"
      {...props}
    >
      <path fill="#004C94" d="M0 0h256v256H0z"/>
      <path fill="url(#a)" d="M0 0h256v256H0z"/>
      <path fill="#fff" d="M37.7 37.7h180.7v180.7H37.7z"/>
      <path fill="#CE1227" d="M203.8 52.3H52.3v151.5h151.5V52.3zM189.2 189.2H66.8V66.8h122.3v122.4z"/>
      <path fill="#fff" d="M189.2 81.4h-55v52.9h55V81.4zm-69.6 55h55v-55h-55v55zm0 0v55h52.9v-55H119.6zm0-69.6v55H66.8v-55h52.8z"/>
      <path fill="#004C94" d="M119.6 119.6h16.9v16.9h-16.9z"/>
      <defs>
        <radialGradient id="a" cx="0" cy="0" r="1" gradientTransform="matrix(0 256 -256 0 128 0)" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0052A1"/>
          <stop offset=".178" stopColor="#004F9C"/>
          <stop offset=".413" stopColor="#00458C"/>
          <stop offset=".684" stopColor="#00336D"/>
          <stop offset="1" stopColor="#001F48"/>
        </radialGradient>
      </defs>
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