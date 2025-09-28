const React = require('react');
const Nav = require('naturalcrit/nav/nav.jsx');

module.exports = function(props){
  return <Nav.item
    color='green'
    icon='fas fa-tachometer-alt'
    href='/projects'
    newTab={false}>
    Projects
  </Nav.item>;
};
