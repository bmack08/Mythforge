const React = require('react');
const Nav = require('naturalcrit/nav/nav.jsx');

module.exports = function(props){
  return <Nav.item
    color='gray'
    icon='fas fa-cog'
    href='/settings'
    newTab={false}>
    Settings
  </Nav.item>;
};
