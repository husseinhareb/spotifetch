export interface Report {
  id: string;
  title: string;
  date: string; // ISO 8601 date string
  description: string;
}

/**
 * Fetches the list of reports from the backend API.
 * @returns Promise resolving to an array of Report objects.
 * @throws Error if the network request fails or the server returns a non-2xx status.
 */
export async function fetchReports(): Promise<Report[]> {
  const response = await fetch('/api/reports', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // include cookies if needed for auth
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to fetch reports: ${response.status} ${response.statusText} - ${text}`);
  }

  const data = await response.json();

  // Optionally validate/transform data here
  return data as Report[];
}
