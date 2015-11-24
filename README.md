#PencilMeIn

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

Now the server should be listening on 
http://localhost:3000

MVP Workflow
______________
Sign in with your google account and you will be able 
to create meetings and invite others. 

After creating a new meeting, you will be redirected to the user overview page, containing a list of all created meetings by the current user. 

Follow the hyperlink to view the calendar for that meeting. 
Copy the URL from your address bar and forward it to your invitees.

The Submit button will submit your availability for the meeting.

After all members have submit, an In is created.

When an in is created, it creates a google calendar event 
in the calendar of the user to submit and then sends 
everyone else in the meeting an email letting them 
know when the meeting is schedule. 

