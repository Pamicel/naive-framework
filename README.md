# The Camagru front end framework

Disclaimer : this is a very egoistic project that is not solving anything for anyone but me.

Here is the backstory

At school 42 there's a web project called Camagru, that involves building an _"Instagram-like"_ app. During this project, the student is prohibited from using __ANY__ framework or library of any kind. The backend must be in PHP and both __the back end and the front end must be strictly and fully built from scratch by the student using only the native form and capabilities of PHP, JS, HTML and CSS__. The finished product has to be compatible with at least Chrome 41 and Firefox 46.

## _But where is the PHP @pamicel ?_
You will not find any PHP here, this is not my Camagru (which you can see and use at [camagru.pamicel.com](https://camagru.pamicel.com/)) this is only the frontend software I built for it.

## Motivations :

The subject for Camagru reads the following : "No Framework, Micro-Framework or library __that is not of your own design__ is authorized." (originally in french : "Aucun Framework, Micro-Framework ou librairie qui n’est pas de votre conception n’est autorisée."). It is anyone's guess what a _"Micro-Framework"_ is... Anyhow, I took that as a challenge.

I have to admit something, I don't like PHP that much, it is partly a subjective thing, I find PHP pretty inelegant and I think it enforces concepts that are quite antiquated. I guess many extensions to PHP solve this, but that was not a comforting thought for me in this context. On the other hand I really like Javascript, mostly naked Javascript.

Said an other way, I want to learn how to build architectures for the web and when I started this project I did not feel like spending this learning time on PHP.

So I was set to build a "framework", but definitely a frontend one.

My plan was to build the simplest Restful API in PHP (to minimise my PHP footprint) and a more complex frontend software that would utilize it.

As I had used VueJS for a personnal project a year before and had a fond memory of how rewarding the experience was, I set out to emulate some concepts of it, to the extent of my n00bish capabilities.

I added a difficulty (apparently I felt masochistic) by restricting myself to extremely basic tooling (no bundlers and no transpilers) so that my correctors would not have a chance to challenge me on not playing by the rules.

# Naive framework features

## A store
[doc](doc_STORE_how-the-store-works.md)

## A router
documentation in progress

## A component structure
[doc](doc_COMPONENTS.md)

## A built-in client 'alert' system
[doc](doc_ALERTS_how-alerts-work.md)


# The overall usage of the naive framework

documentation in progress
