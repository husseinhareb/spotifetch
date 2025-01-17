import styled from "styled-components";

export const Container = styled.div`
  margin: 1.5rem;
  font-family: Arial, sans-serif;
  display: flex;
  flex-direction: column;
`;

export const Heading = styled.h2`
  font-size: 24px;
  color: #333;
  margin: 1rem 0; 
  border-bottom: 1px solid #ccc;
  padding-bottom: 0.5rem;
`;

export const Message = styled.p`
  font-size: 16px;
  color: #666;
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
  color: #777;
  margin-top: 0.05rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const PlayIcon = styled.button`
  background: none;
  border: none;
  color: #333;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: #1db954;
  }
`;


export const TrackItem = styled.li`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.3rem;
  padding: 0.2rem 0;
  border-bottom: 1px solid #f0f0f0;
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
  color: #000;
  margin-right: 1rem; 
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1; 
`;

export const ArtistName = styled.span`
  font-size: 14px;
  color: #555;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
`;

export const PlayedAt = styled.small`
  font-size: 12px;
  color: #999;
  white-space: nowrap;
  text-align: right; 
  flex: 0; 
  margin-left: auto;
`;


export const NavBar = styled.nav`
  width: 100%;
  border-bottom: 1px solid #ddd;
  background-color: #fafafa; 
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

export const NavLink = styled.a`
  display: flex;
  align-items: center;
  text-decoration: none;
  font-size: 0.95rem;
  transition: color 0.3s;

  &:hover {
    color: #333;
  }
`;