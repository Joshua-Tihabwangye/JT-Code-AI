import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return <main className="centered"><h1>Page not found</h1><Link to="/">Return to JT-Code</Link></main>;
}
