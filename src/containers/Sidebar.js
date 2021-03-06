import PropTypes from 'prop-types';
import React, { Fragment, useContext, useState } from 'react';
import AddChannelModal from '../components/AddChannelModal';
import AddTeamModal from '../components/AddTeamModal';
import Channels from '../components/Channels';
import InviteMemberModal from '../components/InviteMemberModal';
import Teams from '../components/Teams';
import { StateContext } from '../state';

const Sidebar = ({ teams, currentTeam }) => {
  const [isAddChannelOpen, toggleAddChanel] = useState(false);
  const [isAddTeamOpen, toggleAddTeam] = useState(false);
  const [isAddMemberOpen, toggleAddMember] = useState(false);
  const { user } = useContext(StateContext);

  return (
    <Fragment>
      <AddChannelModal
        open={isAddChannelOpen}
        onClose={() => toggleAddChanel(false)}
        teamId={currentTeam._id}
      />

      <AddTeamModal
        open={isAddTeamOpen}
        onClose={() => toggleAddTeam(false)}
      />

      <InviteMemberModal
        open={isAddMemberOpen}
        teamId={currentTeam._id}
        onClose={() => toggleAddMember(false)}
      />

      <Teams
        onAddTeamClick={() => toggleAddTeam(true)}
        teams={teams.map(t => ({
          _id: t._id,
          name: t.name.slice(0, 2),
        }))}
      />

      <Channels
        user={user}
        username={user.username || 'hey'}
        users={[{ _id: '1', name: 'javier' }, { _id: '2', name: 'Fernando' }]}
        channels={currentTeam.channels.map(c => ({ name: c.name, _id: c._id }))}
        currentTeam={currentTeam}
        onCreateChannelClick={() => toggleAddChanel(true)}
        onAddTeamMemberClick={() => toggleAddMember(true)}
      />
    </Fragment>
  );
};

Sidebar.propTypes = {
  currentTeam: PropTypes.instanceOf(Object).isRequired,
  teams: PropTypes.instanceOf(Object).isRequired,
  // currentChannel: PropTypes.instanceOf(Object).isRequired,
};

export default Sidebar;
