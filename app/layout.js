import "./globals.css";

export const metadata = {
  title: "FPT UNIVERSITY · Automated C/C++ Grading",
  description: "Submit C source code and get automated grading results.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
	  <footer>Copyright Huyvv. Computing Fundamentals Dept. FPT University Hanoi, Vietnam.</footer>
    </html>
  );
}
