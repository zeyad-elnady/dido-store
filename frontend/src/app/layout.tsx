import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";

export const metadata: Metadata = {
  title: "Dido Store — Fashion from SHEIN, Delivered to Egypt | ديدو ستور",
  description:
    "Shop the latest fashion trends from SHEIN at Dido Store. Dresses, tops, pants, accessories and more — delivered to your doorstep in Egypt. أحدث صيحات الموضة من شين بتوصيل لجميع محافظات مصر.",
  keywords: "dido store, shein egypt, fashion, clothing, ملابس, موضة, شين مصر, فساتين",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  // Restore preferred language if set
                  var savedLang = localStorage.getItem('dido_lang');
                  if (savedLang === 'en') {
                    document.documentElement.lang = 'en';
                    document.documentElement.dir = 'ltr';
                  } else {
                    document.documentElement.lang = 'ar';
                    document.documentElement.dir = 'rtl';
                  }

                  // Block extensions (like Bitdefender) from injecting bis_skin_checked
                  var origSetAttr = Element.prototype.setAttribute;
                  Element.prototype.setAttribute = function(name, val) {
                    if (name === 'bis_skin_checked') return;
                    return origSetAttr.apply(this, arguments);
                  };

                  // Clean up if already present
                  if (typeof MutationObserver !== 'undefined') {
                    var observer = new MutationObserver(function(mutations) {
                      for (var i = 0; i < mutations.length; i++) {
                        var m = mutations[i];
                        if (m.type === 'attributes' && m.attributeName === 'bis_skin_checked') {
                          m.target.removeAttribute('bis_skin_checked');
                        }
                      }
                    });
                    if (document.documentElement) {
                      observer.observe(document.documentElement, {
                        attributes: true,
                        subtree: true,
                        attributeFilter: ['bis_skin_checked']
                      });
                    }
                  }

                  // Intercept console.error to prevent dev overlay from crashing on extension-injected mismatches & 3rd-party scripts
                  var origConsoleError = console.error;
                  console.error = function() {
                    var message = '';
                    for (var i = 0; i < arguments.length; i++) {
                      try {
                        message += ' ' + (typeof arguments[i] === 'object' ? JSON.stringify(arguments[i]) : String(arguments[i]));
                      } catch(e) {
                        message += ' ' + String(arguments[i]);
                      }
                    }
                    if (
                      message.indexOf('bis_skin_checked') !== -1 ||
                      message.indexOf("reading 'M_ID'") !== -1
                    ) {
                      return; // Suppress false-alarm extension errors
                    }
                    return origConsoleError.apply(console, arguments);
                  };
                } catch(e) {}
              })();
            `,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body suppressHydrationWarning>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
