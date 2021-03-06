import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import Dropdown from '../../components/Dropdown';
import Selector from '../../components/Selector';
import Tabs from '../../components/Tabs';
import LineChart from '../../components/LineChart';
import PlayerInfo from './components/PlayerInfo';
import PlayerStatsTable from './components/PlayerStatsTable';
import PlayerDeltasTable from './components/PlayerDeltasTable';
import PlayerRecordsWidget from './components/PlayerRecordsWidget';
import PlayerAchievementsWidget from './components/PlayerAchievementsWidget';
import PlayerCompetitionsTable from './components/PlayerCompetitionsTable';
import PlayerHighlights from './components/PlayerHighlights';
import { getPlayer } from '../../redux/selectors/players';
import { getPlayerDeltas } from '../../redux/selectors/deltas';
import { getPlayerRecords } from '../../redux/selectors/records';
import { getPlayerAchievements } from '../../redux/selectors/achievements';
import { getPlayerCompetitions } from '../../redux/selectors/competitions';
import { getChartData } from '../../redux/selectors/snapshots';
import trackPlayerAction from '../../redux/modules/players/actions/track';
import fetchPlayerAction from '../../redux/modules/players/actions/fetch';
import fetchDeltasAction from '../../redux/modules/deltas/actions/fetch';
import fetchSnapshotsAction from '../../redux/modules/snapshots/actions/fetch';
import fetchRecordsAction from '../../redux/modules/records/actions/fetch';
import fetchAchievementsAction from '../../redux/modules/achievements/actions/fetch';
import fetchCompetitionsAction from '../../redux/modules/competitions/actions/fetchPlayerCompetitions';
import { capitalize, getSkillIcon, getPlayerTypeIcon } from '../../utils';
import { SKILLS } from '../../config';
import './Player.scss';

const OPTIONS = [
  {
    label: 'Import from CML history',
    value: 'import'
  }
];

const TABS = ['Overview', 'Gained', 'Records', 'Achievements', 'Competitions'];

const PERIOD_SELECTOR_OPTIONS = [
  { label: 'Day', value: 'day' },
  { label: 'Week', value: 'week' },
  { label: 'Month', value: 'month' },
  { label: 'Year', value: 'year' }
];

function getMetricOptions() {
  return [
    ...SKILLS.map(skill => ({
      label: capitalize(skill),
      icon: getSkillIcon(skill, true),
      value: skill
    }))
  ];
}

function Player() {
  const { id } = useParams();
  const dispatch = useDispatch();

  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const [selectedDeltasPeriod, setSelectedDeltasPeriod] = useState('week');
  const [selectedDeltasSkill, setSelectedDeltasSkill] = useState(SKILLS[0]);

  // Memoized redux variables
  const player = useSelector(state => getPlayer(state, id));
  const deltas = useSelector(state => getPlayerDeltas(state, id));
  const records = useSelector(state => getPlayerRecords(state, id));
  const achievements = useSelector(state => getPlayerAchievements(state, id));
  const competitions = useSelector(state => getPlayerCompetitions(state, id));

  const experienceChartData = useSelector(state =>
    getChartData(state, id, selectedDeltasPeriod, selectedDeltasSkill, 'experience')
  );

  const rankChartData = useSelector(state =>
    getChartData(state, id, selectedDeltasPeriod, selectedDeltasSkill, 'rank')
  );

  const trackPlayer = async () => {
    try {
      setIsTracking(true);
      await dispatch(trackPlayerAction(player.username));

      fetchAll();
      setIsTracking(false);
    } catch (e) {
      setIsTracking(false);
    }
  };

  const fetchAll = () => {
    dispatch(fetchPlayerAction({ id }));
    dispatch(fetchSnapshotsAction({ playerId: id }));
    dispatch(fetchAchievementsAction({ playerId: id }));
    dispatch(fetchCompetitionsAction({ playerId: id }));
    dispatch(fetchRecordsAction({ playerId: id }));
    dispatch(fetchDeltasAction({ playerId: id }));
  };

  const handleTabChanged = i => {
    setSelectedTabIndex(i);
  };

  const handleDeltasPeriodSelected = e => {
    setSelectedDeltasPeriod((e && e.value) || null);
  };

  const handleDeltasSkillSelected = e => {
    setSelectedDeltasSkill((e && e.value) || null);
  };

  const onTabChanged = useCallback(handleTabChanged, []);
  const onDeltasPeriodSelected = useCallback(handleDeltasPeriodSelected, [setSelectedDeltasPeriod]);
  const onSkillsPeriodSelected = useCallback(handleDeltasSkillSelected, [setSelectedDeltasSkill]);
  const onUpdatedButtonClicked = useCallback(trackPlayer, [player]);

  // Fetch all player info on mount
  useEffect(fetchAll, [dispatch, id]);

  const metricOptions = useMemo(getMetricOptions, [SKILLS]);

  if (!player) {
    return null;
  }

  return (
    <div className="player__container container">
      <div className="player__header row">
        <div className="col">
          <PageHeader title={player.username} icon={getPlayerTypeIcon(player.type)}>
            <Button text="Update" onClick={onUpdatedButtonClicked} loading={isTracking} />
            <Dropdown options={OPTIONS} onSelect={() => {}}>
              <button className="header__options-btn" type="button">
                <img src="/img/icons/options.svg" alt="" />
              </button>
            </Dropdown>
          </PageHeader>
        </div>
      </div>
      <div className="player__controls row">
        <div className="col-md-12 col-lg-7">
          <Tabs tabs={TABS} onChange={onTabChanged} align="space-between" />
        </div>
        {selectedTabIndex !== 1 && (
          <>
            <div className="col-md-6 col-lg-2">
              <Selector options={[{ label: '', value: null }]} disabled />
            </div>
            <div className="col-md-6 col-lg-3">
              <Selector options={[{ label: '', value: null }]} disabled />
            </div>
          </>
        )}
        {selectedTabIndex === 1 && (
          <>
            <div className="col-md-6 col-lg-2">
              <Selector
                options={PERIOD_SELECTOR_OPTIONS}
                selectedIndex={1}
                onSelect={onDeltasPeriodSelected}
              />
            </div>
            <div className="col-md-6 col-lg-3">
              <Selector options={metricOptions} onSelect={onSkillsPeriodSelected} />
            </div>
          </>
        )}
      </div>
      <div className="player__content row">
        {selectedTabIndex === 0 && (
          <>
            <div className="col-lg-3 col-md-7">
              <span className="panel-label">Player details</span>
              <PlayerInfo player={player} />
            </div>
            <div className="col-lg-3 col-md-5">
              {competitions && (
                <PlayerHighlights
                  player={player}
                  competitions={competitions}
                  achievements={achievements}
                />
              )}
            </div>
            <div className="col-lg-6 col-md-12">
              <span className="panel-label">Current stats</span>
              <PlayerStatsTable player={player} />
            </div>
          </>
        )}
        {selectedTabIndex === 1 && (
          <>
            <div className="col-lg-7 col-md-12">
              <LineChart datasets={experienceChartData} />
              <LineChart datasets={rankChartData} invertYAxis />
            </div>
            <div className="col-lg-5 col-md-12">
              <PlayerDeltasTable deltas={deltas} period={selectedDeltasPeriod} />
            </div>
          </>
        )}
        {selectedTabIndex === 2 && (
          <>
            {SKILLS.map(skill => (
              <div key={`records-widget-${skill}`} className="col-md-6 col-lg-4">
                <PlayerRecordsWidget records={records} metric={skill} />
              </div>
            ))}
          </>
        )}
        {selectedTabIndex === 3 && (
          <>
            <div className="col-md-6 col-lg-4">
              <PlayerAchievementsWidget achievements={achievements} type="general" />
            </div>
            <div className="col-md-6 col-lg-4">
              <PlayerAchievementsWidget achievements={achievements} type="experience" />
            </div>
            <div className="col-md-6 col-lg-4">
              <PlayerAchievementsWidget achievements={achievements} type="levels" />
            </div>
          </>
        )}
        {selectedTabIndex === 4 && (
          <div className="col">
            <PlayerCompetitionsTable competitions={competitions} />
          </div>
        )}
      </div>
    </div>
  );
}

export default Player;
