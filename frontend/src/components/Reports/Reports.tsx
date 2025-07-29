import React, { useEffect, useState } from "react";
import { useIsLoggedIn } from "../../services/store";
import { Navigate } from "react-router-dom";
import {
  ReportsContainer,
  ReportsHeader,
  ReportList,
  ReportItem,
  ReportTitle,
  ReportDate,
  ReportDescription,
} from "./Styles/style";
import { fetchReports, Report } from "../../repositories/reportsRepository";

const Reports: React.FC = () => {
  const isLoggedIn = useIsLoggedIn();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadReports = async () => {
      try {
        const data = await fetchReports();
        setReports(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load reports.");
      } finally {
        setLoading(false);
      }
    };
    loadReports();
  }, []);

  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  return (
    <ReportsContainer>
      <ReportsHeader>Reports</ReportsHeader>

      {loading && <p>Loading reports...</p>}
      {error && <p>{error}</p>}

      {!loading && !error && (
        <ReportList>
          {reports.map(report => (
            <ReportItem key={report.id}>
              <ReportTitle>{report.title}</ReportTitle>
              <ReportDate>{new Date(report.date).toLocaleDateString()}</ReportDate>
              <ReportDescription>{report.description}</ReportDescription>
            </ReportItem>
          ))}
        </ReportList>
      )}
    </ReportsContainer>
  );
};

export default Reports;