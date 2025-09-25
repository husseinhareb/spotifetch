import styled from "styled-components";
import { Link } from 'react-router-dom';

export const Container = styled.div`
  margin: 1.5rem;
  font-family: Arial, sans-serif;
  display: flex;
  flex-direction: column;
`;

export const Heading = styled.h2`
  font-size: 24px;
  color: ${({ theme }) => theme.colors.text};
  margin: 1rem 0; 
  border-bottom: 1px solid rgba(0,0,0,0.06);
  padding-bottom: 0.5rem;
`;

export const Message = styled.p`
  font-size: 16px;
  color: rgba(0,0,0,0.6);
  text-align: center;
  margin: 1.5rem 0;
`;

export const TrackList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

export const AlbumImage = styled.img`
  width: 30px;
  height: 30px;
  margin-right: 0.5rem; 
  object-fit: cover;
`;

export const AlbumName = styled.em`
  font-size: 14px;
  color: rgba(0,0,0,0.6);
  margin-top: 0.05rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const PlayIcon = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.text};
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: ${({ theme }) => theme.colors.accent};
  }
`;


export const TrackItem = styled.li`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.3rem;
  padding: 0.2rem 0;
  border-bottom: 1px solid rgba(0,0,0,0.04);
`;

export const TrackDetails = styled.div`
  display: flex;
  flex: 1;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
`;

export const TrackName = styled.strong`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.text};
  margin-right: 1rem; 
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1; 
`;

export const ArtistName = styled.span`
  font-size: 14px;
  color: rgba(0,0,0,0.6);
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
`;

export const PlayedAt = styled.small`
  font-size: 12px;
  color: rgba(0,0,0,0.5);
  white-space: nowrap;
  text-align: right; 
  flex: 0; 
  margin-left: auto;
`;


export const NavBar = styled.nav`
  width: 100%;
  border-bottom: 1px solid rgba(0,0,0,0.06);
  background-color: ${({ theme }) => theme.colors.backgroundSolid};
  padding: 0.5rem 1rem;
`;

export const NavList = styled.ul`
  list-style: none;
  display: flex;
  gap: 2rem;
  margin: 0;
  padding: 0;
`;

export const NavItem = styled.li`
  display: flex;
  align-items: center;
`;

export const NavLink = styled(Link)`
  color: ${({ theme }) => theme.colors.text};
  text-decoration: none;
  padding: 8px;
  /* Add your own styles here */
`;