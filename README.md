# The Camagru front end framework

Disclaimer : this is a very egoistic project, this is not solving anything for anyone but me.

Here is the backstory

At school 42 there's a web project called Camagru, that involves building an _"Instagram-like"_ app. During this project, the student is prohibited from using __ANY__ framework or library of any kind. The backend must be in PHP and both __the back end and the front end must be strictly and fully built from scratch by the student using only the native form and capabilities of PHP, JS, HTML and CSS__. The finished product has to be compatible with at least Chrome 41 and Firefox 46.

## _But where is the PHP @pamicel ?_
You will not find any PHP here, this is not my Camagru (which you can see and use [camagru.pamicel.com](https://camagru.pamicel.com/), only the front end tool I built to help build it.

## _But then what the hell is this @pamicel ?_ Motivations :

I have to admit something, I don't like PHP that much, don't read me as a Javascript diehard, but I find PHP pretty inelegant and I think it enforces concepts that are quite antiquated (of course I am talking about the PHP I know, ie pure PHP with no frameworks or libraries). Said an other way, what I want to learn is how to build architectures for the web and I do not feel like spending this learning time on PHP, sorry.

I found an other motivation in the subject for Camagru. The subject reads the following : "No Framework, Micro-Framework or library __that is not of your own design__ is authorized." (originally in french : "Aucun Framework, Micro-Framework ou librairie qui n’est pas de votre conception n’est autorisée."). It is anyone's guess what a _"Micro-Framework"_ is... Anyhow, I took that as a challenge.

## The plan

So my plan was to build the simplest Restful API in PHP (to minimise my PHP footprint) and a more complex frontend software that would utilise it.

As I had made a project in VueJS a year before and fallen in love with how rewarding the experience was, I set out to emulate some concepts of it, to the extent of my n00bish capabilities.

I essentially wanted to see how far I could go, with my basic understanding of JS, into building something that, even if it took more time to build, would _in fine_ simplify the development of the app. I set this goal for myself : to make the most declarative and simple to use boiler plate **I could**, however complex, and, (apparently I felt masochistic) to use nothing but extremely basic tooling (no NodeJS, meaning no bundlers and no transpilers), so that my correctors would not have a chance to challenge me on not playing by the rules.

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
