export const metadata = {
  title: "Tierra Calma · Informe de Redes",
  description: "Informe mensual de Instagram orgánico y Meta Ads — Tierra Calma, Padre Hurtado",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <style>{`
          @media print {
            body { background: #fff !important; color: #111 !important; }
            .no-print { display: none !important; }
            details { display: block !important; }
            details > summary { display: none !important; }
            section { break-inside: avoid; }
          }
        `}</style>
      </head>
      <body
        style={{
          margin: 0,
          fontFamily:
            "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
          background: "#ffffff",
          color: "#1a1a1a",
        }}
      >
        {children}
      </body>
    </html>
  );
}
