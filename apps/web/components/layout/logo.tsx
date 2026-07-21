import Link from "next/link";

export function Logo() {
  return (
    <Link className="logo" href="/">
      <span className="logo-mark" aria-hidden="true">
        A
      </span>
      <span>Aksess</span>
    </Link>
  );
}
