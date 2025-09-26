const React = require('react');
const Nav = require('naturalcrit/nav/nav.jsx');

module.exports = function(props){
  return <Nav.item
    color='orange'
    icon='fas fa-users'
    href='/collaborate'
    newTab={false}>
    Collaborate
  </Nav.item>;
};
