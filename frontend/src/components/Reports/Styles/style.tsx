import styled from "styled-components";

export const ReportsContainer = styled.div`
  max-width: 800px;
  margin: 40px auto;
  padding: 0 20px;
`;

export const ReportsHeader = styled.h1`
  font-size: 2rem;
  margin-bottom: 20px;
  text-align: center;
`;

export const ReportList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`;

export const ReportItem = styled.li`
  background: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
  transition: background 0.2s;

  &:hover {
    background: #f1f1f1;
  }
`;

export const ReportTitle = styled.h2`
  font-size: 1.5rem;
  margin: 0 0 8px 0;
`;

export const ReportDate = styled.p`
  font-size: 0.9rem;
  color: #666;
  margin: 0 0 12px 0;
`;

export const ReportDescription = styled.p`
  font-size: 1rem;
  color: #333;
  margin: 0;
`;
