import styled from "styled-components";

export const Container = styled.div`
  margin: 2rem;
  font-family: Arial, sans-serif;
  display: flex;
  flex-direction: column;
`;

export const Heading = styled.h2`
  font-size: 24px;
  color: #333;
  margin: 1.5rem 0;
  border-bottom: 1px solid #ccc;
  padding-bottom: 0.5rem;
`;

export const Message = styled.p`
  font-size: 16px;
  color: #666;
  text-align: center;
  margin: 2rem 0;
`;

export const TrackList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

export const TrackItem = styled.li`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f0f0f0;
`;

export const AlbumImage = styled.img`
  width: 50px;
  height: 50px;
  margin-right: 1rem;
  border-radius: 4px;
  object-fit: cover;
`;

export const TrackDetails = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

export const TrackName = styled.strong`
  font-size: 16px;
  color: #000;
  margin-bottom: 0.2rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const ArtistName = styled.span`
  font-size: 14px;
  color: #555;
  margin-right: auto;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const AlbumName = styled.em`
  font-size: 14px;
  color: #777;
  margin-top: 0.2rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const PlayedAt = styled.small`
  font-size: 12px;
  color: #999;
  white-space: nowrap;
  margin-left: auto;
`;

export const PlayIcon = styled.button`
  background: none;
  border: none;
  color: #333;
  margin-right: 1rem;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: #1db954;
  }
`;
