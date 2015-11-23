#PencilMeIn

November 23rd TA Meeting Agenda:
1. Modified MVP specifications
2. clarification of "Demo to mentors" in final project schedule
3. MVP walk through and feedback
4. Debugging advice
5. What does "almost final" demo mean


* First do: 
    ```
    npm install 
    ```

* Then do- if you don't have bower: 
    ```
     sudo npm install -g bower 
    ```

* now do: 
    ```
     bower install 
    ```

* finally: 
    ```
    npm start 
    ```

Now the server should be listing on 
http://localhost:3000

Sign in with your google account and you will be able 
to create meetings and invite others. 


When an in is created, it creates a google calendar event 
in the calendar of the user to submit and then sends 
everyone else in the meeting an email letting them 
know when the meeting is schedule. 

