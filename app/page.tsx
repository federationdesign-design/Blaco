import styles from './page.module.css';

// Phase 2 shell preview. Replaced by the home template in Phase 3.
const SWATCHES = [
  { name: 'green', token: '--colour-green', value: '#00a86b' },
  { name: 'green dark', token: '--colour-green-dark', value: '#008454' },
  { name: 'lime', token: '--colour-lime', value: '#7cda24' },
  { name: 'ink', token: '--colour-ink', value: '#212121' },
  { name: 'heading', token: '--colour-heading', value: '#333333' },
  { name: 'text', token: '--colour-text', value: '#666666' },
  { name: 'grey', token: '--colour-grey', value: '#b2b9c4' },
  { name: 'mist', token: '--colour-mist', value: '#f5f5f5' },
];

export default function ShellPreview() {
  return (
    <div className={styles.wrap}>
      <p className={styles.kicker}>Phase 2 shell preview</p>
      <h1>Heading 1, Baskervville</h1>
      <h2>Heading 2, Baskervville</h2>
      <h3>Heading 3, Baskervville</h3>
      <h4>Heading 4, Baskervville</h4>
      <p className={styles.body}>
        Body copy in Baskervville at the base step. Every size on this page scales with the viewport between 390px and
        1440px. This page only shows the tokens and the shell, and is replaced by the home template in Phase 3.{' '}
        <a href="#main">An inline link</a>.
      </p>
      <p>
        <a className={styles.button} href="#main">
          Button, Raleway bold
        </a>
      </p>

      <h2 className={styles.sectionTitle}>Colour tokens</h2>
      <ul className={styles.swatches}>
        {SWATCHES.map((swatch) => (
          <li key={swatch.token} className={styles.swatch} data-token={swatch.name}>
            <span className={styles.chip} />
            <span>
              <strong>{swatch.name}</strong>
              <br />
              <code>{swatch.value}</code>
            </span>
          </li>
        ))}
      </ul>

      <div className={styles.panels}>
        <div className={styles.heroGradient}>Hero gradient</div>
        <div className={styles.panelGradient}>Panel gradient</div>
      </div>
    </div>
  );
}
