import React from 'react';
import { Link } from 'react-router-dom';


function Header() {
  return (
    <header>
      <ul>
        <li><Link to="#" onClick={e => e.preventDefault()}>关于长颈鹿</Link></li>
        <li><Link to="#" onClick={e => e.preventDefault()}>联系作者</Link></li>
        <li><Link to="#" onClick={e => e.preventDefault()}>反馈中心</Link></li>
      </ul>
    </header>
  );
}


function Header_welcome() {
  return (
    <header>
      <ul>
        <li><Link to="#" onClick={e => e.preventDefault()}>关于长颈鹿</Link></li>
        <li><Link to="#" onClick={e => e.preventDefault()}>联系作者</Link></li>
        <li><Link to="#" onClick={e => e.preventDefault()}>反馈中心</Link></li>
      </ul>
      <h1 className="Welcome">欢迎回来!</h1>
    </header>
  );
}


export default Header;
export { Header_welcome }; // Export Header_welcome for use in other components
