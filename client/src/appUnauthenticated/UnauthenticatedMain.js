import React from 'react';
import { Switch, Route } from 'react-router-dom';
import PageSignup from './pages/PageSignup/PageSignup';
import PageLogin from './pages/PageLogin/PageLogin';
import PageConfirmAccount from './pages/PageConfirmAccount/PageConfirmAccount';
import PageResetPassword from './pages/PageResetPassword/PageResetPassword';
import PageHome from './pages/PageHome/PageHome';
import Page404UnAuth from './pages/Page404UnAuth/Page404UnAuth';

const UnauthenticatedMain = () => (
  <main>
    <Switch>
      <Route exact path='/' component={PageHome}/>
      <Route exact path='/confirm/:hash' component={PageConfirmAccount}/>
      <Route exact path='/resetPassword/:hash' component={PageResetPassword}/>
      <Route exact path='/login' component={PageLogin}/>
      <Route exact path='/signup' component={PageSignup}/>
      <Route component={Page404UnAuth}/>
    </Switch>
  </main>
);

export default UnauthenticatedMain;
