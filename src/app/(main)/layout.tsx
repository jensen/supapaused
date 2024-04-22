import Header from "./header";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />
      <div className="flex-grow py-4">{children}</div>
    </>
  );
}
