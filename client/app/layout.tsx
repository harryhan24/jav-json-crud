export const metadata = {
  title: 'JSON CRUD 관리',
  description: 'JSON CRUD Management System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
