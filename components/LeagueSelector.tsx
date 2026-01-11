'use client';

import { League } from '@/types/currency';

interface LeagueSelectorProps {
  leagues: League[];
  selectedLeague: string;
  onSelect: (leagueId: string) => void;
  disabled?: boolean;
}

export default function LeagueSelector({
  leagues,
  selectedLeague,
  onSelect,
  disabled = false,
}: LeagueSelectorProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-300">リーグ</label>
      <select
        value={selectedLeague}
        onChange={(e) => onSelect(e.target.value)}
        disabled={disabled}
        className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {leagues.map((league) => (
          <option key={league.id} value={league.id}>
            {league.name}
          </option>
        ))}
      </select>
    </div>
  );
}
