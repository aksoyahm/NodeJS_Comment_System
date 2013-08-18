Description:

Develop a commenting system that provides the following functionality:

    Allows to post a new TOPIC, in the form of a short text (140 characters) plus a link (mandatory).
    Allows a user to REPLY to any topic with a short text
    Replies are threaded, which means users can reply to other replies, creating a tree-like structure with all the replies. Topics are always the root for any branch.
    Allows users to VOTE UP the best REPLIES
    Displays a list of all current TOPICS. Each topic will be displayed along with their threaded replies organized by VOTES. You’ll have to use an algorithm that sorts the topics based on the votes all their replies received.
    When clicking on the topic text, the list of all replies associated with that topic should appear dynamically, without reloading the entire page.   The replies should be sorted in such a way that those that have received the most votes appear at the top of the list.

Requirements

    The system is anonymous and so there is NO need to login or keep track of users. (for simplicity sake)
    The system will consist of two main components: the front end, which should be implemented as ONE web page called index.html and the back end, which should be implemented as a Node.js server implementing a REST API. The page is allowed to use the basic jQuery library.
    All the operations need to be performed by the server and can only be requested via your own REST API.   This means that aside from loading the initial index.html page, there should be no other pages served by the server.
    The Node.js server does NOT require a database. For the purpose of this assignment it is ok to loose all data when the server is stopped.
    Your Node.js server should use any one of the available ports requested by the customer. The frontend must be accessible using the root URL. For instance,
    if your server is running on port 1234 on local machine, we will only
    test http://127.0.0.1:1234/
