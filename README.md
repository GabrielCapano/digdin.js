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


    <a href="#" data-fmk-click="" data-fmk-callback="alert('hello world')">Hello World</a>

Which attributtes do we have?
=============================
###fmk-{event}={event}
To trigger an event like click or change, etc. You also can call *[data-fmk-click=click]*, this will trigger de event when DOM load is complete.

###fmk-action={action}
The actions you want to execute [see action list](#)

###fmk-condition={function}
The condition that must be true to execute de action.
Usage:
    
    <a href="#" data-fmk-click="" 
                data-fmk-condition="isThisTheRealLife" 
                data-fmk-callback="alert('hello world')">
      Hello World
    </a>
    

###fmk-condition-callback={function}
The callback for condition, it's triggered when condition isn't true.


###fmk-schedule={milliseconds}
Schedule the action.
Usage:


    <a href="#" data-fmk-click="" 
                data-fmk-schedule="3000" 
                data-fmk-callback="alert('Hmmm, i'm scheduled!')">
      Hello World
    </a>
    
###fmk-ajax-callback={function}
Callback for actions that execute ajax operations

###fmk-target={DOM element identifier}
The target DOM element that will be used in actions

###fmk-source={DOM element identifier|URL|Form|Select}
The source for actions.

###fmk-template={Template script tag}
Template for action executing, very simillar to handlebars.js.
Usage:
    
    <script type="text/html" id="Template">
        i'm a template {myTemplate}
        usages:
        {Response.Object.Name}
        {{(new Date()).getMinutes}}
    </script>
    
###fmk-confirm={confirm dialog text}
Confirm's the action

