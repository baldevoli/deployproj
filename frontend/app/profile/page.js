'use client';

import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import styles from '../../styles/Profile.module.css';

export default function UserProfile() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/signin');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) {
    return (
      <>
        <Navbar />
        <div className={styles['profile-container']}>
          <div className={styles['profile-card']}>
            <h2>Loading profile...</h2>     
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className={styles['profile-container']}>
        <div className={styles['profile-card']}>
          <h2 className={styles['profile-title']}>User Profile</h2>
          <div className={styles['profile-details']}>
            <div className={styles['profile-item']}><strong>User ID:</strong> {user.user_id}</div>
            <div className={styles['profile-item']}><strong>First Name:</strong> {user.first_name}</div>
            <div className={styles['profile-item']}><strong>Last Name:</strong> {user.last_name}</div>
            <div className={styles['profile-item']}><strong>Email:</strong> {user.email}</div>
            <div className={styles['profile-item']}><strong>Phone:</strong> {user.phone}</div>

            <div className={styles['profile-item']}><strong>Status:</strong> {user.status}</div>
           
          </div>
        </div>
      </div>
    </>
  );
}
