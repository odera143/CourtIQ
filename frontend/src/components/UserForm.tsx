import { useQuery } from '@tanstack/react-query';
import React, { useState, type SetStateAction, type Dispatch } from 'react';

const UserForm = ({
  onSubmit,
  gridFt,
  setGridFt,
}: {
  onSubmit: (params: any) => void;
  gridFt: number;
  setGridFt: Dispatch<SetStateAction<number>>;
}) => {
  const [playerQuery, setPlayerQuery] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<string>('2022-23');
  const [selectedSeasonType, setSelectedSeasonType] =
    useState<string>('Regular Season');
  const [minAtt, setMinAtt] = useState<number>(3);

  const {
    data: playerData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['players'],
    enabled: false,
    queryFn: () =>
      fetch(`http://127.0.0.1:8000/api/players?q=${playerQuery}`).then((res) =>
        res.json(),
      ),
  });

  const buildRequestParams = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlayer) return;
    const params = {
      player_id: selectedPlayer.id,
      season: selectedSeason,
      season_type: selectedSeasonType,
      grid: gridFt.toString(),
      min_att: minAtt.toString(),
    };
    onSubmit(params);
  };

  return (
    <form className='settings-container' onSubmit={buildRequestParams}>
      <span>{`Player selected: ${selectedPlayer?.name ?? 'None'} (id: ${selectedPlayer?.id ?? 'None'})`}</span>
      <input
        placeholder='player name'
        value={playerQuery}
        onChange={(e) => {
          setPlayerQuery(e.target.value);
          e.target.value.length > 2 && refetch();
        }}
      ></input>
      <div>
        {isLoading && <p>Loading...</p>}
        {error && <p>Something went wrong</p>}
        <div>
          {playerData?.map((player: { id: string; name: string }) => (
            <div key={player.id} onClick={() => setSelectedPlayer(player)}>
              {player.name}
            </div>
          ))}
        </div>
      </div>
      <select
        name='season'
        id='season-select'
        value={selectedSeason}
        onChange={(e) => setSelectedSeason(e.target.value)}
      >
        <option value='2018-19'>2018-19</option>
        <option value='2019-20'>2019-20</option>
        <option value='2020-21'>2020-21</option>
        <option value='2021-22'>2021-22</option>
        <option value='2022-23'>2022-23</option>
        <option value='2023-24'>2023-24</option>
        <option value='2024-25'>2024-25</option>
        <option value='2025-26'>2025-26</option>
      </select>
      <select
        name='seasonType'
        id='season-type-select'
        value={selectedSeasonType}
        onChange={(e) => setSelectedSeasonType(e.target.value)}
      >
        <option value='Regular Season'>Regular Season</option>
        <option value='Playoffs'>Playoffs</option>
      </select>
      <input
        type='number'
        placeholder='minimum attempts per zone'
        value={minAtt}
        onChange={(e) => setMinAtt(Number(e.target.value))}
      />
      <input
        type='number'
        placeholder='zone size (ft)'
        value={gridFt}
        onChange={(e) => setGridFt(Number(e.target.value))}
      />
      <button type='submit'>Submit</button>
    </form>
  );
};
export default UserForm;
