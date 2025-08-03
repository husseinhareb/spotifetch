import React from 'react';
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
} from 'recharts';

interface MusicRatioProps {
  currentTracks: number;
  lastTracks: number;
  currentAlbums: number;
  lastAlbums: number;
  currentArtists: number;
  lastArtists: number;
}

const MusicRatio: React.FC<MusicRatioProps> = ({
  currentTracks,
  lastTracks,
  currentAlbums,
  lastAlbums,
  currentArtists,
  lastArtists,
}) => {
  // Prepare ratio percentages
  const data = [
    { name: 'Artists', value: (currentArtists / (currentArtists + lastArtists)) * 100, fill: '#A78BFA' },
    { name: 'Albums', value: (currentAlbums / (currentAlbums + lastAlbums)) * 100, fill: '#34D399' },
    { name: 'Tracks', value: (currentTracks / (currentTracks + lastTracks)) * 100, fill: '#3B82F6' },
  ];

  return (
    <div className="flex bg-black text-white rounded-lg p-6 items-center">
      {/* Chart */}
      <div className="w-60 h-60">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="55%"
            outerRadius="100%"
            barSize={12}
            barGap={4}
            data={data}
            startAngle={90}
            endAngle={-270}
          >
            <RadialBar
              dataKey="value"
              background={{ fill: '#374151' }}
              cornerRadius={6}
            />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>

      {/* Metrics */}
      <div className="ml-8 space-y-6">
        <div>
          <h3 className="text-sm uppercase text-gray-400">Tracks</h3>
          <p className="text-2xl font-semibold">
            {currentTracks}{' '}
            <span className="text-gray-500 text-sm">vs. {lastTracks} (last week)</span>
          </p>
        </div>
        <div>
          <h3 className="text-sm uppercase text-gray-400">Albums</h3>
          <p className="text-2xl font-semibold">
            {currentAlbums}{' '}
            <span className="text-gray-500 text-sm">vs. {lastAlbums} (last week)</span>
          </p>
        </div>
        <div>
          <h3 className="text-sm uppercase text-gray-400">Artists</h3>
          <p className="text-2xl font-semibold">
            {currentArtists}{' '}
            <span className="text-gray-500 text-sm">vs. {lastArtists} (last week)</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default MusicRatio;
