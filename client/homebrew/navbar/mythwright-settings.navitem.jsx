import React from 'react';
import Nav from 'naturalcrit/nav/nav.jsx';

const MythwrightSettingsNavItem = function(props){
  return <Nav.item
    color='gray'
    icon='fas fa-cog'
    href='/settings'
    newTab={false}>
    Settings
  </Nav.item>;
};

export default MythwrightSettingsNavItem;
