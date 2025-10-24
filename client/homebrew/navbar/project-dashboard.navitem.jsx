import React from 'react';
import Nav from 'naturalcrit/nav/nav.jsx';

const ProjectDashboardNavItem = function(props){
  return <Nav.item
    color='green'
    icon='fas fa-tachometer-alt'
    href='/projects'
    newTab={false}>
    Projects
  </Nav.item>;
};

export default ProjectDashboardNavItem;
