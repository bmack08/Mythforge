import React from 'react';
import createClass from 'create-react-class';
import Nav from 'naturalcrit/nav/nav.jsx';

const ProjectCreationNavItem = createClass({
  displayName: 'ProjectCreationNavItem',

  render: function() {
    return (
      <Nav.item
        href='/create-project'
        color='blue'
        icon='fas fa-plus-circle'
      >
        New Project
      </Nav.item>
    );
  }
});

export default ProjectCreationNavItem;