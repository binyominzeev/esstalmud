import Link from "next/link";

export default function Home() {
  return (
    <main className="content">
      <div className="welcome">
        <h1>The Essentialist Talmud</h1>
        <p>Válassz egy traktátust a bal oldali sávból, vagy kezdd az elejétől:</p>
        <p>
          <Link href="/berakhot/2a" className="btn">Berakhot 2a</Link>
        </p>
      </div>
    </main>
  );
}
