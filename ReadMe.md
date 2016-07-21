### FSG's Client Metadata Search
###### Created by: Jack Langston

#### Introduction

This program suite performs two functions:

1. It can utilize the Bing search engine to find potential LinkedIn URLs for clients and prospects
2. It can utilize LinkedIn URLs to find a client and prospect's current position, company, and location in order to keep the SalesForce database up-to-date

What does this mean for you?

1. You will never have to manually run thousands of LinkedIn searches in order to find the handful of people who have changed jobs in the last day/month/quarter.
2. You can bulk search LinkedIn URLs for new database entries.
3. 

Hopefully, this helpful utility will help to save countless hours of data entry for our commercial team!


#### Installation

As this is a fairly brief program whipped up by interns in their free time, you can only interact with this program via the command line.
But don't worry! The commands are easy, and this guide will take you through a step-by-step tutorial of getting it all set-up.


1. This program suite runs on Node.js, a javascript language that can run right on your computer! The various platform installers can be found here: https://nodejs.org/en/#download. Make sure that you are using Version 6 or later.

2. Let's make sure you have the proper versions of Node.js (you need v6.x.x or later). After installation please run the following commands in a command line interface:

> node -v

You should see a v6.x.x. If not, please consult this guide (assuming you are using windows): http://blog.teamtreehouse.com/install-node-js-npm-windows

3. After getting the latest version of Node.js, please navigate to the folder with the program files with your command line interface.

4. Once there, run the following command and wait for the dependencies to download:

>npm install

5. BOOM! You're done! Congratulations on your installation. Please see the following sections for information on how to use the two program functions.

#### LinkedIn URL Finder

######*Note: Every API key only provides you access with 5,000 searches per month. As such, you should use this feature sparingly, and should record the LinkedIn URLs in the SalesForce database so you do not need to run this twice for any given individual.*
######*Note 2: The resulting URLs do NOT have a 100% accuracy rate. Sometimes clients/prospects do not have active LinkedIn profiles, so this will often return invalid URLs. Additionally, the search is only as good as Bing (which is to say, not the very best). Keep in mind that this is meant to serve as a utility, not an end-to-end solution.*

#####(1) Setup
- In order for the search functionality to work, you must have a list of Bing API keys.



#### Client Metadata Search

This program will utilize a .csv file from SalesForce to scrape LinkedIn for the most up-to-date information on our clients and prospects (assuming they have a LinkedIn). As this does not rely on search heuristics, you can have 100% confidence in the information provided, so long as you have correct URLs.
 
#####(1) Setup
The only step you need to prepare for running this progam is to insert a .csv file containing the following fields in the folder where the program (scrape.js) is stored.
This .csv file should contain ONLY the following fields IN THIS ORDER: first name, last name, company/account, LinkedIn Url. For example, one line might look like:

`Jack,Langston,Frontier Strategy Group,https://linkedin.com/in/jacklangston`

This file must be called `urls.csv`.

#####(2) Running the program
To run the program, simply execute the following command in a command line interface position inside the program folder:

>node scrape.js

#####(3) Output
You should see the program's progress in the command line interface. Once completed, it will create an output file, `positions.csv`. You can open this file with Microsoft Excel or any other text editor in order to manipulate the data.

The output rows will be in the following format:

`FirstName,LastName,Company/Account,LinkedInURL,Title_1,Company_1,Location_1,...,Title_N,Company_N,Location_N`

*Note: This progam will only find an individual's CURRENT positions.*

If you do not see company output for any given person, please reference the below error message list.

Error Messages:

- "Not a valid URL" -  The URL given for this person's LinkedIn does not point to a LinkedIn page
- "No valid positions found" - This individual's LinkedIn does not contain any current position data
- "ERR!" - If you find this error, that means that the program has encountered some unexpected behavior. Please seek advice from the project manager.

#### Support

If you should run into issues, please seek advice form the project manager.



