const React = require('react');
const createClass = require('create-react-class');
const Nav = require('naturalcrit/nav/nav.jsx');

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

module.exports = ProjectCreationNavItem;