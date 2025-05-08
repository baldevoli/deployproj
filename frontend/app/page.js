// app/page.js
import Link from "next/link";
import styles from "../styles/Home.module.css";

export default function Home() {
  return (
    <div className={styles.homeContainer}>
      <div className={styles.titleBanner}>
        <Link href="/" className={styles.titleLink}>Retriever&apos;s Essentials</Link>
      </div>

      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1>Welcome to Retriever&apos;s Essentials</h1>
          <p>Your campus food pantry - supporting UMBC students with free food essentials</p>
          <div className={styles.heroButtons}>
            <Link href="/available-items" className={styles.primaryButton}>View Available Items</Link>
            <Link href="/signin" className={styles.secondaryButton}>Sign In</Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className={styles.aboutSection}>
        <h2>About Retriever&apos;s Essentials</h2>
        <p>We&apos;re dedicated to ensuring that no UMBC student goes hungry. Our free campus food store provides essential food items to support our student community.</p>
        
        <div className={styles.statsContainer}>
          <div className={styles.statItem}>
            <h3>100+</h3>
            <p>Students Served</p>
          </div>
          <div className={styles.statItem}>
            <h3>50+</h3>
            <p>Items Available</p>
          </div>
          <div className={styles.statItem}>
            <h3>Opens</h3>
            <p>Every Friday</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className={styles.howItWorksSection}>
        <h2>How It Works</h2>
        <div className={styles.stepsContainer}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <h3>Sign In</h3>
            <p>Create an account or sign in with your UMBC credentials</p>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <h3>Browse Items</h3>
            <p>View available food items in our inventory</p>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <h3>Pick Up</h3>
            <p>Visit our location to pick up your selected items</p>
          </div>
        </div>
      </section>
    </div>
  );
}
