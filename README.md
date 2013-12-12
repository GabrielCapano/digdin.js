digdin.js
=========

A Javascript framework for ui development


digdin.js is based on knockout.js and angular.js it's a simplified framework that is very easy extensionable.

Examples
========

- [Example 1](http://gypsolutions.com.br/digdin/examples/)

Why use digdin.js?
==================
Because it's simplicity and the bundle of jQuery plugins that come with, it'll ease your life with web app development!


Extension
=========
You can easyly create new framework actions, that allows you to manipullate for fiting on your own needs.

How to use?
===========
Digdin uses html attributtes to configure the ui interaction, example:


    <a href="#" data-dgd-click="" data-dgd-callback="alert('hello world')">Hello World</a>

Which attributtes do we have?
=============================
###dgd-{event}={event}
To trigger an event like click or change, etc. You also can call *[data-dgd-click=click]*, this will trigger de event when DOM load is complete.

###dgd-action={action}
The actions you want to execute [see action list](#)

###dgd-condition={function}
The condition that must be true to execute de action.
Usage:
    
    <a href="#" data-dgd-click="" 
                data-dgd-condition="isThisTheRealLife" 
                data-dgd-callback="alert('hello world')">
      Hello World
    </a>
    

###dgd-condition-callback={function}
The callback for condition, it's triggered when condition isn't true.


###dgd-schedule={milliseconds}
Schedule the action.
Usage:


    <a href="#" data-dgd-click="" 
                data-dgd-schedule="3000" 
                data-dgd-callback="alert('Hmmm, i'm scheduled!')">
      Hello World
    </a>
    
###dgd-ajax-callback={function}
Callback for actions that execute ajax operations

###dgd-target={DOM element identifier}
The target DOM element that will be used in actions

###dgd-source={DOM element identifier|URL|Form|Select}
The source for actions.

###dgd-template={Template script tag}
Template for action executing, very simillar to handlebars.js.
Usage:
    
    <script type="text/html" id="Template">
        i'm a template {myTemplate}
        usages:
        {Response.Object.Name}
        {{(new Date()).getMinutes}}
    </script>
    
###dgd-confirm={confirm dialog text}
Confirm's the action

