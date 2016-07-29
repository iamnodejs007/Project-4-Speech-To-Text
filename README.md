# WDI Project 4: Speech-To-Text


![](./public/images/screenshot.png)

### Objective

Create a web application that will help you improve your public speaking skills by telling how many times you say/repeat certain words, such as "like" and "um, in your speech. ("um" does not work, yet)

### Installation

* Run an npm install in the terminal
* In server.js, remove "process.env.DB_URL" and replace it with 'mongodb://localhost/speech-to-text'
* Run mongodb in the terminal (install if not already on your machine)


### Project Requirements

The guidelines listed below were provided by the project markdown:

* Build a full-stack application by making your own backend and your own front-end
* Have an API of your design
* Have an interactive front-end, preferably using a modern front-end framework
* Be a complete product, which most likely means multiple relationships and CRUD functionality for at least a couple models
* Use a database, whether that's one we've covered in class or one you want to learn
* Implement thoughtful user stories that are significant enough to help you know which features to build and which to scrap
* Have a visually impressive design to kick your portfolio up a notch and have something to wow future clients & employers
* Be deployed online so it's publicly accessible

Necessary Deliverables

* A working API, hosted somewhere on the internet
* A working front-end, hosted somewhere on the internet
* A link to your hosted working app in the URL section of your Github repo
* A git repository hosted on Github, with a link to your hosted project, and frequent commits dating back to the very beginning of the project
* A readme.md file with:
* An embedded screenshot of the app
Explanations of the technologies used
	* A couple paragraphs about the general approach you took
	* Installation instructions for any dependencies
	* Link to your user stories – who are your users, what do they want, and why?
	* Link to your wireframes – sketches of major views / interfaces in your application
	* OPTIONAL: Link to your pitch deck – documentation of your wireframes, user stories, and proposed architecture
Descriptions of any unsolved problems or major hurdles you had to overcome


### MVP

* Users can create an account as well as delete their account
* Users can record their voice and the app will transcribe their speech as they speak, and then log how many times the keywords were said
* Users can save their speeches to a database and then retrieve them later
* Users can delete their speeches after they have been saved



### Technologies/Frameworks used

* HTML5
* CSS3
* Javascript
* jQuery
* EJS
* AJAX
* Node.js
* Express.js
* MongoDB
* mLabs
* p5.js
* p5.speech
* Passport


### Major hurdles/problems

1. IBM Watson Speech-to-text configuration
2. Passport
3. DOM manipulation 

### Future Implementations

* Improve CSS styling
* Add ability to upload an audio file to be transcribed
* Fix minor bugs
* Fix speech recognition on Heroku
