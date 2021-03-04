import Head from 'next/head'
import styles from '../styles/Home.module.css'
import { parse } from 'node-html-parser';
import axios from 'axios';
import url from 'url'

Home.getInitialProps = async (ctx) => {
  const user = url.parse(ctx.req.url, true).query.user || 'gumdad'

  const now = new Date();
  const start = new Date(Date.parse('01 Jan 2021 00:00:00 GMT-8'));
  const diff = (now - start) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
  const oneDay = 1000 * 60 * 60 * 24;
  const day = Math.floor(diff / oneDay) + 1;  // current day of the year

  const movies = await Promise.all(
    [...Array(Math.min(12, Math.ceil(day/28))).keys()]
      .map(mo => 
        axios.get(`https://letterboxd.com/${user}/films/diary/for/2021/${mo + 1}/`)
             .then(resp => parse(resp.data).querySelectorAll('.diary-entry-row').length)
      )
    ).then(counts => counts.reduce((accumulator, currentValue) => accumulator + currentValue))

  return { day, movies, user }
}

export default function Home({ movies, day, user }) {
  return (
    <div className={styles.container}>
      <Head>
        <title>2021 movies</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          <a href={`https://letterboxd.com/${user}/`}>{user}</a>
          {` has watched ${movies} movies in ${day} days of 2021`}
        </h1>
      </main>
    </div>
  )
}
