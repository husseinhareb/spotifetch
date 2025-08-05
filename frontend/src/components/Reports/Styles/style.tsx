// src/components/Reports/Styles/style.ts
import styled, { keyframes } from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// ────────────────────────────────────────────────────────────
// Container
// ────────────────────────────────────────────────────────────
export const Container = styled.div`
  padding: 20px;
  background: #000;
  color: #fff;
`;

// ────────────────────────────────────────────────────────────
// Top Music / Week Navigation
// ────────────────────────────────────────────────────────────
export const WeekNav = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #ffc0c0;
  padding: 24px 40px;
  margin-bottom: 24px;
  height: 80px;
`;

export const NavButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #fff;
  cursor: pointer;

  &:hover {
    opacity: 0.8;
  }
`;

export const WeekTitle = styled.div`
  font-weight: bold;
  font-size: 1.25rem;
  color: #fff;
`;

// ────────────────────────────────────────────────────────────
// Listens Header
// ────────────────────────────────────────────────────────────
export const ListenHeader = styled.div`
  display: flex;
  align-items: baseline;
  padding: 0 40px;
  margin-bottom: 24px;
`;

export const ListenLabel = styled.p`
  margin: 0;
  font-size: 1.2rem;
  flex: 1;
`;

export const ListenValue = styled.h1`
  margin: 0 16px;
  font-size: 4rem;
`;

export const ListenChange = styled.span`
  font-size: 1rem;
  display: inline-flex;
  align-items: center;

  svg {
    margin-right: 6px;
    font-size: 1.2rem;
  }
`;

// ────────────────────────────────────────────────────────────
// Weekly Bar Chart
// ────────────────────────────────────────────────────────────
export const ChartRow = styled.div`
  display: flex;
  padding: 0 40px 60px;
  align-items: flex-end;
  gap: 16px;
  height: 280px;
  width: 100%;
  justify-content: space-between;
`;

export const DayBar = styled.div<{ height: number }>`
  flex: 1;
  height: ${props => props.height}px;
  background: #fd3030;
  border-radius: 4px 4px 0 0;
  position: relative;

  &:after {
    content: attr(data-label);
    position: absolute;
    top: 100%;
    margin-top: 4px;
    font-size: 0.75rem;
    color: #555;
  }
`;

// ────────────────────────────────────────────────────────────
// Summary Cards (Top Music ratios)
// ────────────────────────────────────────────────────────────
export const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 32px;
`;

export const SummaryCard = styled.div<{ bg: string }>`
  background: ${props => props.bg};
  color: #000;
  position: relative;
  border-radius: 8px;
  padding: 20px;
`;

export const Label = styled.p`
  margin: 0;
  font-size: 1rem;
  opacity: 0.8;
  text-transform: uppercase;
`;

export const Value = styled.h2`
  margin: 8px 0;
  font-size: 2.5rem;
`;

export const Change = styled.span`
  display: inline-flex;
  align-items: center;
  font-size: 0.9rem;
  opacity: 0.9;

  svg {
    margin-right: 4px;
  }
`;

export const ChartIcon = styled(FontAwesomeIcon)`
  position: absolute;
  bottom: 12px;
  right: 12px;
  opacity: 0.3;
  font-size: 2rem;
`;

// ────────────────────────────────────────────────────────────
// Detail Cards (Top Artists / Albums / Tracks)
// ────────────────────────────────────────────────────────────
export const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 32px;
`;

export const Card = styled.div`
  background: #121212;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

// ────────────────────────────────────────────────────────────
// slow zoom keyframes
// ────────────────────────────────────────────────────────────

// ────────────────────────────────────────────────────────────
// Detail Cards (Top Artists / Albums / Tracks)
// ────────────────────────────────────────────────────────────
export const CardImage = styled.div<{ img?: string }>`
  background: url(${props => props.img || ''}) center center no-repeat;
  background-size: 100%;
  height: 600px;
  position: relative;
  overflow: hidden;

  /* transition will smoothly animate both into and out of hover */
  transition: background-size 0.2s linear;

  &:hover {
    background-size: 110%;
  }
`;
// Overlay container for the “#1” text, subtitles, and listen counts
export const Overlay = styled.div`
  position: absolute;
  bottom: 16px;
  left: 16px;
  right: 16px;
  background: rgba(0, 0, 0, 0.6);
  padding: 12px;
  border-radius: 8px;
  color: #fff;

  h3, p {
    margin: 4px 0;
  }
`;

export const CardLabel = styled.span<{ bg: string }>`
  position: absolute;
  top: 12px;
  left: 12px;
  background: ${props => props.bg};
  color: #000;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  text-transform: uppercase;
`;

export const CardBody = styled.div`
  padding: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
`;

export const Title = styled.h3`
  margin: 0 0 8px;
  font-size: 1.2rem;
`;

export const Subtitle = styled.p`
  margin: 0 0 12px;
  font-size: 0.9rem;
  color: #ccc;
`;

export const Listens = styled.p`
  margin: 0;
  font-size: 0.9rem;
  color: #ccc;
`;

// ────────────────────────────────────────────────────────────
// “New items” Small Cards
// ────────────────────────────────────────────────────────────
export const SmallGrid = styled(DetailGrid)`
  margin-bottom: 0;
`;

export const SmallCard = styled(Card)`
  flex-direction: row;
  align-items: center;
  padding: 16px;
`;

export const SmallValue = styled.h2`
  margin: 0;
  font-size: 2rem;
  flex: 1;
`;

export const SmallList = styled.ul`
  display: flex;
  margin: 0;
  padding: 0;
  list-style: none;
`;

export const SmallItem = styled.li`
  display: inline-flex;
  align-items: center;
  margin-right: 12px;

  img {
    width: 40px;
    height: 40px;
    border-radius: 4px;
    margin-right: 8px;
  }
`;

// ────────────────────────────────────────────────────────────
// Generic Sections & Chart Boxes
// ────────────────────────────────────────────────────────────
export const Section = styled.div`
  display: flex;
  gap: 40px;
  margin-bottom: 40px;
`;

export const ChartBox = styled.div`
  flex: 1;
  height: 300px;
  background: #111;
  border-radius: 8px;
  padding: 20px;
  color: #fff;
`;

export const ChartTitle = styled.h4`
  margin-bottom: 16px;
  font-size: 1.1rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

// ────────────────────────────────────────────────────────────
// Listening Clock styled‐components
// ────────────────────────────────────────────────────────────
export const ClockSection = styled(Section)`
  gap: 40px;
  margin-bottom: 40px;
  flex-wrap: wrap;
`;

export const ClockChartBox = styled(ChartBox)`
  flex: 1.5;
  min-width: 0;
  height: 300px;
`;

export const ClockInfoBox = styled(ChartBox)`
  flex: 0.5;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 20px;
`;

export const ClockInfoLabel = styled.p`
  margin: 0;
  font-size: 1rem;
  opacity: 0.8;
  text-transform: uppercase;
`;

export const ClockInfoValue = styled.h2`
  margin: 8px 0;
  font-size: 2.5rem;
`;
