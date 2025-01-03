import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'Rocket is fast',
    Svg: require('@site/static/img/f_f_traffic_46_svg_f_traffic_46_2nbg.svg').default,
    description: (
      <>
        If you stay in the sky for too long, you might get attacked by a rocket.
      </>
    ),
  },
  {
    title: 'Paper is made from trees',
    Svg: require('@site/static/img/f_f_business_91_svg_f_business_91_0nbg.svg').default,
    description: (
      <>
        We should be mindful not to waste paper. By using it responsibly, we can help conserve natural resources and reduce environmental impact. Simple actions like printing double-sided or reusing scrap paper can make a big difference in protecting our planet.
      </>
    ),
  },
  {
    title: 'Hamburger is delicious',
    Svg: require('@site/static/img/f_f_health_37_svg_f_health_37_1nbg.svg').default,
    description: (
      <>
        Avoid eating too many hamburgers to maintain good health. Consuming them in moderation helps prevent excessive calorie and fat intake, supporting a balanced diet and overall well-being. Opt for healthier alternatives when possible.
      </>
    ),
  },
];

function Feature({Svg, title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
