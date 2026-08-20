import PageHero from '../components/PageHero';
import { MAPS } from '../lib/constants';
import InstagramGrid from '../components/InstagramGrid';
import { usePageMeta } from '../hooks/usePageTitle';
import { getPageSeo } from '../seo/routes';

export default function TrailsPage() {
  usePageMeta(getPageSeo('/hack-farm-trails/')!);

  return (
    <>
      <PageHero
        title="Interactive Hack Trail Map"
        subtitle="Bring your own horse and ride our trails"
      />
      <section className="section section--cream">
        <div className="container">
          <p>For those riders that are bringing their own horses we have put together an interactive trail map to help you go out and have fun with your equine companion.</p>
          <p><strong>Please note</strong> that the map below is only to be used as a guide as the tides and inlets are always shifting and changing. Always ride to the conditions and ALWAYS check the tide times before leaving on a longer ride. It is a good idea to check in with Baerbel before leaving too.</p>
          <p style={{ marginTop: '1rem' }}>
            <a href={MAPS.trailView} target="_blank" rel="noopener noreferrer" className="btn btn--green">View Map</a>
          </p>
        </div>
      </section>
      <section className="section section--white">
        <div className="container">
          <iframe
            className="map-embed"
            src={MAPS.trailMap}
            title="Hack Farm Trail Map"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>
      <InstagramGrid />
    </>
  );
}
