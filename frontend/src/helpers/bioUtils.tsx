// Rename this file to src/helpers/bioUtils.tsx
import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Truncate a bio to maxWords, then append a <Link> to the artist page.
 */
export function trimBioWithLink(
  text: string,
  artistId: string,
  maxWords = 19
): React.ReactNode {
  const words = text.split(' ');
  if (words.length <= maxWords) return text;

  const preview = words.slice(0, maxWords - 3).join(' ') + '... ';
  return (
    <>
      {preview}
      <Link to={`/artist/${encodeURIComponent(artistId)}`} style={{ color: '#007bff' }}>
        Click to read more
      </Link>
    </>
  );
}
