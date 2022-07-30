import { AppProps } from 'next/app';
import '../styles/global.css';
import 'prismjs/plugins/line-numbers/prism-line-numbers.css';
import '../styles/prism-custom-theme.css';
import '../styles/prism-overrides.css';

export default function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
