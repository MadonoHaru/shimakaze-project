import React, { Component } from 'react';
import { Segment, Button, Header } from 'semantic-ui-react';

export const Forum = props => {
  (function() { // DON'T EDIT BELOW THIS LINE
  var d = document, s = d.createElement('script');
  s.src = 'https://madonoharu.disqus.com/embed.js';
  s.setAttribute('data-timestamp', +new Date());
  (d.head || d.body).appendChild(s);
  })();
  return (
    <Segment>
      <div id="disqus_thread"></div>
      <noscript>Please enable JavaScript to view the <a href="https://disqus.com/?ref_noscript">comments powered by Disqus.</a></noscript>
    </Segment>
  );
};
