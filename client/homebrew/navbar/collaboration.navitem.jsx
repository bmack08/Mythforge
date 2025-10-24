import React from 'react';
import Nav from 'naturalcrit/nav/nav.jsx';

const CollaborationNavItem = function(props){
  return <Nav.item
    color='orange'
    icon='fas fa-users'
    href='/collaborate'
    newTab={false}>
    Collaborate
  </Nav.item>;
};

export default CollaborationNavItem;
