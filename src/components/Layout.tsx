import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import BookCtas from './BookCtas';
import { useFareHarborCart } from '../hooks/usePageTitle';

export default function Layout() {
  useFareHarborCart();
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
      <BookCtas />
    </>
  );
}
