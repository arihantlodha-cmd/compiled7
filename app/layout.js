import { DM_Serif_Display, DM_Sans, DM_Mono } from 'next/font/google'
import './globals.css'

const dmSerif = DM_Serif_Display({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-display',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-body',
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-mono',
})

export const metadata = {
  title: 'Pilot — AI Copilot for Product Managers',
  description: 'Turn PM chaos into clarity. Paste raw notes, get structured PRDs, user stories, and stakeholder updates in seconds.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${dmSerif.variable} ${dmSans.variable} ${dmMono.variable} bg-ink text-paper antialiased font-body`}>
        {children}
      </body>
    </html>
  )
}
