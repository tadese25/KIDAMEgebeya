export const metadata = {
  title: 'NOVA — The modern store',
  description: 'Electronics, fashion, home, beauty, sports and more. Designed to feel premium.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}