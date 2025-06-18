import '../styles/globals.css';
import type { AppType } from 'next/app';
import { Poppins } from 'next/font/google';
import { hiraishin } from '@/assets';
import { DefaultSeo } from 'next-seo';
import Link from 'next/link';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const poppins = Poppins({ weight: ['400', '500', '600', '700'], subsets: ['latin'] });

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: false,
      staleTime: Infinity,
    },
  },
});

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <main className={poppins.className}>
      <DefaultSeo
        title="Hiraishin"
        openGraph={{
          images: [{ url: hiraishin.src }],
          siteName: 'Hiraishin',
          url: 'https://hiraishin.vercel.app',
          type: 'website',
        }}
        twitter={{ cardType: 'summary_large_image' }}
      />
      <div className="w-full flex justify-center">
        <Link
          href={'/'}
          className="text-5xl md:text-7xl my-10 font-bold text-transparent w-fit bg-clip-text bg-gradient-to-r from-slate-100 to-slate-400"
        >
          HIRAISHIN
        </Link>
      </div>
      <QueryClientProvider client={queryClient}>
        <Component {...pageProps} />
      </QueryClientProvider>
    </main>
  );
};
export default MyApp;
