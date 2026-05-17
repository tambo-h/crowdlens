



1. when user logs into the app again, check if the user has any habits, links, and rules in the database. If not, run the AI service to generate them.

2. check in timings - allow user to set a specific time of the day to do a standup with AI. 
3. Next time user logs into the app, check if the habits are getting progressed or not. 

4. user should be able to add a habit to the habit tracker on his own, not just ai generated habits. the ui should actually support adding habits. 

5. the saved links can have a preview of the link as thumbnail and can be saved on local storage. 

6. Deep work feature - if user wants to complete a habit streak using deepwork, Give option to schedule a meeting on user's calender. Where user can block time for 2 hours (configurable)

7. Good evening, Developer! 👋 - this app is not only designed for Developer but also other people. come up with some other intro. 

8. month option in habit widget is not working.

9. once you click on get started, you cant go back to main screen. 

10 . Chat bot should generate a list of habits as preview and then ask user for confirmatoin .

11. remove the seed guest data button. it is useless. 


12. the habit tracker could have tutorials or reference resources or links . 

13. completed today counter should be on top of the habit tracker card 


14.  habit seggregation based on the prompt1. prompt2. 



---------------------------------------------------------------------------------
15. adding custom quotes doesnt retain and show the quote. the custom quotes can be deleted and edited as well. 

16. code snippets cant be edit or deleted. 

17. the chat interface on the extreme right should have full tambo ui, as user is not able to see the previous chats. 

18.  if the user is logged in for the first time ever, give the user an option to copy the prompt -> with examples . 
 example : 1. setup my workspace as a nextjs developer.
            2. setup my workspace as a business analyst.
            3. setup my workspace as a project manager. 


18.a. 
Skills Mastery
🎯
/10

NaN% complete

there is a bug in ui it shows Nan% complete. 

19. change in user onboard flow.  keep the continue as guest user , or ask for a user PIN. 

a user PIN is generated for every user who is also a guest . use this as primary key for the redis key - >  when user logs in back to the app, ask for a PIN if not entered already .    remove the login with github and google, not needed.  
the pin should be entered as an OTP style ui . and saved in local storage. 


20 . lets say i have 20 habits, and i click on the 20th habit (expand) the ai architecting ui comes up, and populates with challenge steps. but then the ui refreshes and scrolls to the top, i want the ui to scroll back to the 20th habit. 



The habit tracking should be revamped, to challenges. 

Lets say I am an angular app developer. 
And i got like 10 habits to build. 

It should actually be 10 challenges. 

1. like build an angular app with caching mechanism.
 
 2. understand 2 way binding of components.

 ... and so on. 


 Now in each of the challenges : 
 you need to give resources which are helping the user achieve the challenges. 

 build another api that will accept a challenge as input and then respond with  detailed steps + resources for each challenge.
 
 for all the links to resources.  you can track it in the link menu and 


 Habit tracker card will itself have seggregatoins : 

lets say user gives a prompt : setup workspace for angular developer
 1.Angular developer skills  will have 10 challenges

 lets say user gives 2nd prompt : give me skills for nodejs developer

 1. node js dev skills will have 10 challenges,  BUT the habit tracker card will be renamed to "node js skill tracker" 

 instead of Habits, i think u should call it as Skills