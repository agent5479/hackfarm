import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import BookCtas from './BookCtas';
import { JsonLd } from './JsonLd';
import SaveBar from '../cms/SaveBar';
import { useFareHarborCart } from '../hooks/usePageTitle';

export default function Layout() {
  useFareHarborCart();
  return (
    <>
      <JsonLd />
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
      <BookCtas />
      <SaveBar />
    </>
  );
}
