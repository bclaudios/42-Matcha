import React from 'react';
import { Switch, Route } from 'react-router-dom';
import PageSearch from './pages/PageSearch/PageSearch';
import PageMatcher from './pages/PageMatcher/PageMatcher';
import PageNotifications from './pages/PageNotifications/PageNotifications';
import Profile from './pages/PageProfile/PageProfile';
import ProfileEdit from './pages/PageProfileEdit/PageProfileEdit';
import Page404Auth from './pages/Page404Auth/Page404Auth';

const AuthenticatedApp = () => (
  <main>
    <Switch>
      <Route exact path='/search' component={PageSearch}/>
      <Route exact path='/notifications' component={PageNotifications}/>
      <Route exact path='/matcher' component={PageMatcher}/>
      <Route exact path='/profile' component={Profile}/>
      <Route exact path='/profile/edit' component={ProfileEdit}/>
      <Route exact path='/profile/:username' component={Profile}/>
      <Route component={Page404Auth}/>
    </Switch>
  </main>
);

export default AuthenticatedApp;
