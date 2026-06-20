import { Outlet, Link } from 'react-router-dom';
import styles from './App.module.scss';

export function App() {
  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <h1 className={styles.title}>HomeKit</h1>
        <nav className={styles.nav}>
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
        </nav>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
