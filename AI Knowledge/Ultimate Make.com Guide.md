{\rtf1\ansi\ansicpg1252\cocoartf2822
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 .AppleSystemUIFontMonospaced-Regular;}
{\colortbl;\red255\green255\blue255;\red249\green248\blue242;\red36\green36\blue35;}
{\*\expandedcolortbl;;\cssrgb\c98039\c97647\c96078;\cssrgb\c18824\c18824\c18039;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\deftab720
\pard\pardeftab720\partightenfactor0

\f0\fs24 \cf2 \cb3 \expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 Advanced Guide to Building Make.com Scenarios\
Overview of Advanced Use Cases in Make.com\
Make.com (formerly Integromat) enables complex, cross-platform automations that can power advanced use cases in areas like revenue operations, marketing, and IT. For example, a RevOps scenario might integrate a CRM (e.g. HubSpot) with phone and email systems to qualify leads and update pipelines automatically\
o8.agency\
o8.agency\
. In another case, Make can automate data cleanup tasks \'96 such as removing duplicate records in a database or spreadsheet \'96 using its flow control modules and array functions\
community.make.com\
. These scenarios often involve multiple steps, conditional logic, and data transformations. This guide will cover the tools and best practices needed to build and troubleshoot such complex workflows, so that AI assistants (like Claude) can reliably help users construct them.\
Modules and Connections: The Building Blocks\
A Make scenario is essentially a series of modules that dictate how data flows between apps/services\
help.make.com\
. Each module is either a trigger (event that starts the workflow) or an action/search (an operation performed, like creating a record or querying data)\
make.com\
. Make offers thousands of pre-built app modules, plus a no-code toolkit to connect to any API not in the library\
make.com\
. This means you can integrate virtually any system \'96 from HubSpot to custom databases \'96 in a visual workflow. When you add a module to a scenario, you\'92ll typically need to configure a connection to the app\'92s account or API. For built-in apps, this is often an OAuth login or API key that Make will prompt for (Make handles storing credentials securely as a \'93connection\'94). To add a module in the scenario builder, click the + on the canvas (or \'93Add another module\'94) and search for the app or tool you need\
help.make.com\
. After inserting the module, select or create the connection (for example, choose your HubSpot account or enter an API key) and fill in the required module fields. You can map outputs from previous modules into these fields using Make\'92s drag-and-drop mapping interface (more on mapping below). Each module can be tested individually \'96 you can run a single module in Make to see if it\'92s configured correctly before running the whole scenario.\
Drafting and Using JSON Blueprints\
Make allows you to export any scenario as a JSON blueprint and later import it to create a copy of the scenario. The blueprint is essentially the scenario\'92s configuration in JSON format\
primarygoals.com\
. This is useful for versioning, sharing, or deploying automations across environments. However, caution is needed when editing blueprints manually. The JSON will contain unique identifiers (for modules, connections, etc.) that are specific to the original environment. If you import the blueprint into a new team or account, those IDs may not match the new environment\'92s records. As one expert noted, simply importing a blueprint with mismatched IDs can result in broken or \'93invalid\'94 modules, which then must be reconfigured from scratch\
primarygoals.com\
. The recommended approach is to update any environment-specific IDs in the JSON before import (e.g. find-replace old IDs with new ones)\
primarygoals.com\
. In fact, some users write scripts to automate this JSON adjustment for large deployments\
primarygoals.com\
. When drafting JSON blueprints, ensure the syntax is exactly correct \'96 even a minor formatting issue could make the blueprint unloadable. It\'92s usually easiest to create a scenario in the Make UI, export the blueprint, and use that as a starting template for edits (rather than writing JSON from scratch). Remember that while blueprints are powerful for copying scenarios, Make\'92s support team does not officially support manual JSON editing \'96 so use this feature carefully and always keep backup copies of working blueprints.\
Flow Control: Routers, Filters, Iterators, and Aggregators\
Advanced scenarios often require branching, looping, or merging data flows. Make provides flow control modules (under the \'93Flow Control\'94 or \'93Tools\'94 app) to handle these needs.\
Routers for Conditional Branching\
A Router allows you to branch the scenario into multiple paths (routes) that run different sequences of modules in parallel (logically) based on conditions\
help.make.com\
. Each route can have an optional filter \'96 a set of conditions (using operators like >, <, =, etc.) that determine if a bundle of data should proceed down that path\
help.make.com\
. For example, you might use a router to fork a lead processing flow: one route for high-value leads (if deal_value > $10,000, then do X), another for low-value leads (do Y), and a third as a fallback for any data that didn\'92t match the other routes\
help.make.com\
. You can reorder router paths and designate any route as the fallback route (the route that catches data not handled by other branches)\
help.make.com\
. It\'92s important to note that routers in Make do not execute routes truly in parallel \'96 they run sequentially in the order you set\
help.make.com\
. Make will attempt the first route\'92s modules, then the second, and so on, for each incoming bundle. Ordering matters if a bundle could meet multiple route conditions: the earlier route will capture it and subsequent routes won\'92t see that bundle. If needed, you can change the processing order via the router\'92s context menu (\'93Order routes\'94)\
help.make.com\
. Also, use the \'93fallback route\'94 feature for any catch-all logic that should run after all filtered routes (the fallback is marked by a special arrow icon)\
help.make.com\
. To add a router, either attach it to an existing module\'92s output or right-click a connection line and choose \'93Add a router\'94\
help.make.com\
. Each router branch can then continue with its own modules. You can even select a whole branch and copy/paste or delete it as a unit, which is useful for duplicating complex logic paths\
help.make.com\
.\
Iterators for Looping Through Arrays\
An Iterator is a special module that takes an array (list) of items and emits each item as a separate bundle\
help.make.com\
. In simpler terms, it converts one bundle with an array into multiple bundles \'96 one per array element. This allows you to loop through a list of data. For example, if a previous module returns an array of file attachments or a list of records, an iterator can process each attachment/record one-by-one through subsequent modules\
help.make.com\
. In the scenario canvas, you insert the iterator module and in its configuration, you map the array field that you want to split apart\
help.make.com\
. After the iterator, the modules will treat each item independently (as if triggered one at a time). A practical use case is saving email attachments: a Gmail trigger might output an array of attachments, so you add an Iterator after it to handle each attachment separately (e.g., upload each file to Google Drive)\
help.make.com\
. When configuring an iterator, set the Array input to the list you want to iterate (this could be a mapped array field from a previous module). Many popular apps provide built-in iterators in their modules; for instance, the Gmail app has an \'93Iterate attachments\'94 module that effectively does the same as a generic iterator but saves you from specifying the array manually\
help.make.com\
. Under the hood, these are just pre-configured iterator modules. Mapping data after an iterator: One quirk with iterators (and some other modules) is that the following modules need to know the data structure of the items in the array. If the platform cannot infer the structure (say you\'92re iterating over outputs of a JSON parser or a webhook without a defined schema), the mapping panel in subsequent modules will only show generic placeholders (like \'93total number of bundles\'94 and \'93bundle order\'94)\
help.make.com\
. In such cases, simply execute the scenario (or run just the iterator\'92s source module) once with sample data. This will let the iterator \'93learn\'94 the structure of the items it\'92s outputting, and then the mapping panel will populate the actual fields for you to map\
help.make.com\
help.make.com\
. Alternatively, if you know the structure, you can define a data structure for the preceding module (e.g., provide a schema for the JSON parser or webhook) so that the iterator knows the item properties in advance. The key point is: if you can\'92t see expected fields to map after an iterator, run the scenario once or use a Parse JSON module with a data structure to help Make identify the fields\
help.make.com\
.\
Aggregators for Merging Data\
An Aggregator is essentially the opposite of an iterator: it collects multiple bundles and merges them into a single bundle containing an array\
help.make.com\
. You use aggregators when you need to combine results \'96 for example, gather a list of records from multiple search operations and then process that whole list at once. When an aggregator module runs, it accumulates all incoming bundles (from a specified source module) and then outputs one bundle with an array of all those items\
help.make.com\
. The output array\'92s structure depends on the aggregator type and settings (Make offers different aggregator modules, such as \'93Array aggregator\'94, \'93Text aggregator\'94, \'93Archive/Create an archive\'94 etc., each with specific behavior). To set up an aggregator, you must designate a Source Module \'96 the point in the flow where aggregation begins\
help.make.com\
. Typically, the source is an iterator or any module that produces multiple bundles (e.g. a search that returns many records)\
help.make.com\
. When you select the source module in the aggregator\'92s config and close it, Make will highlight the flow from that source to the aggregator with a grey background, indicating those bundles will be captured for aggregation\
help.make.com\
. Downstream of the aggregator, you\'92ll have a single bundle to work with (containing an array of all aggregated items). Aggregators often provide options like \'93Group by\'94 \'96 which lets you create multiple output bundles grouped by a formula or key. If used, the aggregator will output one bundle per distinct key value, each containing an array of the grouped items\
help.make.com\
. For example, you could group form submission bundles by \'93country\'94 field so that you get separate arrays of submissions per country. Another option is \'93Stop processing after an empty aggregation\'94 \'96 normally, if no bundles reach the aggregator, it will still output an empty array bundle, but enabling this setting will instead output nothing and stop that route (useful if subsequent modules shouldn\'92t run on empty data)\
help.make.com\
. Include the right fields: Note that bundles output by the source module (and any modules in between source and aggregator) won\'92t be directly accessible after aggregation unless you include their data in the aggregator\'92s setup\
help.make.com\
. For instance, the Array Aggregator allows selecting which fields to aggregate. If you omit certain fields, those won\'92t be present in the merged array. A best practice is to include any data you\'92ll need later in the flow. Example \'96 zipping email attachments: Imagine a scenario where you watch an email for attachments, then want to zip all attachments into one archive and upload to Dropbox. You could use an Iterator to loop through each attachment file, then use an Archive aggregator (Create archive) to collect each file bundle into a single ZIP file bundle, and finally a Dropbox module to upload that file\
help.make.com\
help.make.com\
. In this example, the aggregator\'92s source is the iterator (so it aggregates all bundles the iterator produces into one bundle containing an archive). Aggregators and iterators are often paired like this to first split a collection, process items, then recombine results.\
Other Flow Control Tools\
Make provides additional flow control modules, including:\
Repeater: Generates a specified number of bundles in a row, essentially a simple loop that repeats N times\
help.make.com\
. The Repeater\'92s output includes an incrementing counter (i) which you can use in subsequent modules (e.g., send 5 emails with subjects \'93Hello 1\'94 ... \'93Hello 5\'94 by using i in the subject)\
help.make.com\
. This is useful for fixed-count loops or testing scenarios with dummy iterations.\
Router w/ multiple inputs: (advanced) You can connect multiple incoming paths into a single module by linking them to the same module (Make will automatically insert a router-like junction). However, note that this is just a visual merge; each incoming route will still trigger the module separately \'96 it\'92s not an aggregator. True combination of data requires an aggregator as discussed.\
Flow control vs. filters: Regular module filters (the tiny wrench icon between modules) are a simpler way to conditionally continue or stop a single path. In contrast, a Router creates distinct branches. Use filters for straightforward yes/no conditions, and routers when you truly need separate parallel paths or multiple outcomes.\
Data Mapping, Transformation, and Variables\
One of Make\'92s strengths is its visual data mapping. After each module, the output data (fields) can be mapped into subsequent modules. You simply drag fields from the output panel into the input fields of the next module. Make will automatically handle data types and conversions where possible. If an output might be missing or null, you can use the lambda (\uc0\u9888 \u65039 ) symbol to supply fallback values or the error handlers (discussed later) to catch mapping errors.\
Parsing and Structuring Data (JSON, XML, etc.)\
When working with APIs or webhooks, you\'92ll often encounter raw JSON or XML. Make has dedicated modules like JSON > Parse JSON and XML > Parse XML to convert raw text into structured bundles. When you use these, you should provide a data structure (schema) or a sample so that Make knows what fields to output. As described earlier with iterators, if a module doesn\'92t have a defined schema, you might need to run the scenario once with sample data or use the \'93Generate schema\'94 feature. For instance, in an OAuth HTTP request scenario, after getting a JSON response, you can copy that JSON and use it to auto-generate a schema in the Parse JSON module\
help.make.com\
help.make.com\
. Once parsed, the data becomes available as distinct fields to map in later modules. Tip: The HTTP modules have a \'93Parse response\'94 option that can automatically parse JSON or XML responses into structured bundles\
apps.make.com\
. If you enable this, you typically need to run the module once so that Make can infer the response structure and show those fields. This saves you from manually adding a Parse JSON module. If the response content is complex or varies, you might still opt to handle it manually for reliability.\
Built-in Functions for Data Transformation\
Make provides a rich library of functions for transforming data within the mapping editor (similar to formulas in Excel or functions in programming). These include text functions (e.g. upper(), substring()), date/time functions, math, and array functions. You can combine functions and fields in the mapping text areas using the function editor (accessible via the fx icon or by typing directly in a field). For example, to concatenate two fields with a dash you could use concat(field1; "-"; field2). For arrays, Make offers powerful functions like:\
map(array; key) \'96 extract a specific field from an array of objects, returning an array of those values. E.g. map(contacts[]; name) would pull the name property from an array of contacts. You can even filter within map() by adding conditions\
help.make.com\
.\
distinct(array; [key]) \'96 remove duplicate values from an array\
help.make.com\
. If the array is of simple values, just provide the array. If it\'92s an array of collections/objects, provide the key to compare. For instance, distinct(contacts[]; name) returns an array of contacts with unique name values (duplicates by name removed)\
help.make.com\
.\
join(array; separator) \'96 join array elements into a single string (useful for creating comma-separated lists)\
help.make.com\
.\
length(array) \'96 count items in an array\
help.make.com\
.\
contains(array; value) \'96 check if an array contains a value\
help.make.com\
, etc.\
There are many more (sorting, filtering, merging arrays) \'96 see Make\'92s Functions documentation for the full list. These functions allow you to manipulate data without extra modules. For example, to remove duplicates from an array of email addresses, you could use distinct(emails[]) directly in a mapping field\
community.make.com\
, or to filter an array of objects by some property, you might combine map() and distinct() or use filter() (Make has an if() and choose() function for conditional logic in mappings as well). Mastering these functions can greatly simplify your scenarios and reduce the number of modules needed.\
Variables and Data Stores\
Make scenarios are mostly stateless (each run is independent), but you do have options to store and reuse values. The \'93Set variable\'94 module allows you to define a variable in one module and use it later in the scenario. However, its scope is just that scenario run. For longer-term storage or cross-run persistence, Make offers Data Stores (a built-in mini-database where you can read/write records) and Aggregation (as covered earlier) to carry data through a scenario. Data Stores are beyond the scope of this guide, but note they exist if you need to maintain state across scenario executions.\
Error Handling and Troubleshooting\
When scenarios encounter unexpected data or runtime errors (e.g. an API call fails, a required field is missing, a service is rate-limited), Make will throw an error and by default, stop the scenario execution. Advanced scenarios should leverage Make\'92s Error Handling features to gracefully handle these situations and keep automations running reliably\
help.make.com\
. How Error Handling Works: In Make, you can attach an error handler route to any module. This is essentially a branch (drawn with a transparent bubble connector) leading to one of five special Error Handler modules\
help.make.com\
. If the module throws an error, the error handler route activates and executes the connected handler (and any modules after it on that branch)\
help.make.com\
. If an error is caught and handled, Make will consider the scenario run anticipated (not a crash) and will continue scheduling future runs normally\
help.make.com\
. If an error is not handled, the scenario run is marked as errored, and depending on settings, it may stop future scheduling or be saved as an incomplete execution. Make provides five types of error handler modules\
help.make.com\
, each with different behavior:\
Ignore Error \'96 Completely suppresses the error. The offending bundle is dropped (it will not continue through the main route), but the scenario run continues with the next bundle or operation normally\
help.make.com\
. The scenario ultimately ends with Success status as if no error happened. Use this when an error can be safely disregarded (e.g. a non-critical API call fails) and you want the scenario to move on. (Best practice: use Ignore only for errors that truly have no impact, or when you\'92ve handled the fallout within the error route, such as logging the error elsewhere.)\
Resume Error \'96 Catches the error and allows you to inject substitute data for the failed module, then continues the flow\
help.make.com\
. The scenario carries on as if the module succeeded with whatever data you provide in the Resume handler. This is useful if you have a fallback value or default you can use when a module fails. For example, if a lookup fails, you might resume with a default record. The scenario ends with Success status\
help.make.com\
.\
Break Error \'96 Think of this as \'93skip the rest of this scenario run, but don\'92t mark it as failed.\'94 When a Break handler is triggered, Make stores the state of the scenario at that point as an incomplete execution (if enabled) for review\
help.make.com\
. It then stops processing any further modules for the current run, but any other independent bundles that were being processed will continue, and the scenario overall ends with a Warning status\
help.make.com\
. In effect, Break says \'93stop this path here, but let other parallel bundles finish and don\'92t stop future scheduled runs.\'94 This is often used in batch-processing scenarios \'96 e.g. if one record fails, break out and handle it later, but allow others to proceed. If \'93Allow storing incomplete executions\'94 is on in scenario settings, the partial execution is saved and can be retried or examined\
help.make.com\
. You can also set the error handler to automatically mark the incomplete execution as resolved (i.e. auto-complete) so it doesn\'92t require manual intervention\
help.make.com\
.\
Commit Error \'96 Immediately stop the scenario run and mark it successful\
help.make.com\
. \'93Commit\'94 is typically used in scenarios that involve transactions or aggregated results. It means \'93end the run now, commit what\'92s been done so far as final.\'94 No further modules are executed after the Commit handler triggers\
help.make.com\
. The scenario ends with Success status. Use this if the error signifies \'93we\'92re done, successfully, with whatever was completed before.\'94 (In practice, Commit is not very common unless using transactional modules.)\
Rollback Error \'96 Immediately stop the scenario run and undo any changes in modules that support transactions\
help.make.com\
. This is the most severe handler. It will cancel the run, and any modules that had partial changes (e.g., in an aggregator or in a database transaction) will roll back if possible\
help.make.com\
. The scenario ends with Error status. Essentially, Rollback says \'93abort mission and revert.\'94 This is the default behavior if no error handler is attached and if \'93incomplete executions\'94 are disabled\
help.make.com\
 (i.e., by default an unhandled error equates to a rollback). Rollback is useful for critical processes where any error means nothing should be committed.\
You can attach these handlers by right-clicking on a module and selecting \'93Add error handler\'94, then choosing the handler type. Once attached, the error path can include additional modules (for example, you might follow an Ignore handler with a Slack notification module to alert someone that the error occurred, which is a common pattern). If an error handler route itself throws an error (e.g. your Slack notification fails), that will terminate that error route \'96 the original scenario run would then end as an error after all, so design error handlers to be robust (perhaps using Ignore within the error route if needed to prevent loops). Incomplete Executions & Auto-Retries: In scenario settings, you can allow storing incomplete executions \'96 this means if an error is unhandled (or a Break/Rollback happens), the state at failure is saved. You can then manually resume those runs after fixing the issue, or even bulk replay them\
help.make.com\
help.make.com\
. This is very useful for important scenarios where you don\'92t want to lose data. For transient errors (like rate limits or temporary outages), Make has some default retry logic especially if incomplete executions are enabled. For example, rate limit errors and connection errors are automatically handled by Make via exponential backoff retries\
help.make.com\
 \'96 often you don\'92t need a custom handler for those if you can accept a delay. For other error types or critical data, plan a strategy: Decide which errors can be ignored, which should trigger alerts, and which should halt everything. Often, a combination is used: e.g., Ignore non-critical failures (logging them for review), Break on intermediate failures to isolate bad data, and let truly critical issues Rollback or stop the scenario so you can fix the root cause. In summary, error handlers let you build resilience into your automations. A well-designed scenario should not simply fail silently \'96 it should either recover, skip, or notify someone when things go wrong. Use Make\'92s tools to achieve that.\
Webhooks, APIs, and HTTP Integration\
Beyond built-in app modules, advanced scenarios often involve connecting to external web services via webhooks or HTTP requests. Make provides powerful features for these cases:\
Receiving Data with Webhooks\
Make\'92s Webhooks module (built-in app) allows your scenario to react to incoming HTTP requests. When you use a Custom Webhook trigger module, Make generates a unique URL (endpoint) which you can give to any service that can send webhooks\
apps.make.com\
apps.make.com\
. Each scenario\'92s webhook is unique and can only be used in that scenario (you can\'92t have two scenarios share one webhook URL)\
apps.make.com\
. Setting up a Custom Webhook: Insert a Webhooks > Custom webhook module at the start of your scenario. In the configuration, click Add to create a new webhook, give it a name, and save. Make will generate the URL and start listening\
apps.make.com\
. To define the expected data structure, you have a few options:\
Easiest: Right after creating the webhook, copy the URL and send a sample request (e.g. via cURL or from the service that will call it). If Make receives data at that URL while the scenario is listening (or by using the \'93Redetermine structure\'94 function), it will automatically capture the payload and infer the data structure\
apps.make.com\
apps.make.com\
. This structure is then used to show mapping fields for subsequent modules. (Note: Doing this does not create a globally reusable data structure; it just ties the structure to this webhook instance\
apps.make.com\
. If you want reusability or validation, see next point.)\
Manual or Reusable: You can go to Make\'92s Data structures section and define a custom structure (JSON schema). Then in the webhook settings, select that existing structure\
apps.make.com\
. This has the added benefit of enabling payload validation: if incoming data doesn\'92t match the schema, Make will reject it with a 400 error\
apps.make.com\
apps.make.com\
. If you don\'92t need strict validation, the on-the-fly method above is usually fine (the data will just be treated as text fields by default if no structure).\
You can also adjust the webhook module later and click Redetermine data structure, then send a sample again to update it\
apps.make.com\
.\
Make webhooks can accept data via query parameters, form data, or JSON body (even simultaneously). If multiple formats are sent, Make merges them into one bundle; query string keys will override others if there\'92s a conflict\
apps.make.com\
apps.make.com\
. The platform supports file uploads via multipart form-data as well (you\'92ll need to have a data structure with a field of type \'93collection\'94 containing name, mime, and data for the file)\
apps.make.com\
. The maximum payload size for a webhook is 5 MB\
apps.make.com\
. By default, when a custom webhook trigger fires, Make immediately sends an HTTP 200 response back to the sender with a simple \'93accepted\'94 message (or a 400 if the webhook queue is full)\
apps.make.com\
. If you need to customize the response (for example, send a specific JSON or HTML reply, or a different status code), use the Webhook Response module in your scenario. This module, when placed in the flow (usually right after the webhook trigger or at the end of your logic), lets you specify an exact HTTP status code and body to return to the caller\
apps.make.com\
. For instance, you could return a 201 status with a JSON body acknowledging the data. You should also set appropriate headers (like Content-Type) in a Custom headers field of the response module to match the body format (e.g. Content-Type: application/json)\
apps.make.com\
. Using Webhook Response, you can even redirect the caller (e.g., send a 303 Redirect with a Location header) or return an HTML page\
apps.make.com\
. Keep in mind the timeout: the webhook response must be sent within 180 seconds of the request\
apps.make.com\
. If your scenario hasn\'92t executed a response by then, the caller will just get the default \'93202 Accepted\'94 and the scenario will continue asynchronously\
apps.make.com\
. So, if you intend to use Webhook Response, ensure your scenario processes within 3 minutes or design it to send an initial response and handle longer processing separately. Security tips: Webhooks by nature are entry points into your workflow. If needed, use the webhook settings to restrict allowed IP addresses (IP whitelist) for calls, or implement a verification (e.g., a secret token passed as a parameter which you check via a filter function in Make)\
apps.make.com\
. For example, you might include a secret in the webhook URL as a query param and use a filter in the scenario to ignore requests that don\'92t have the correct value. This isn\'92t necessary for all cases, but good to consider for sensitive processes.\
Calling External APIs with HTTP Modules\
If you need to integrate with a web service that isn\'92t already a pre-built Make app, the HTTP app modules are your go-to solution. The HTTP app supports various authentication methods and request types: Choosing the right HTTP module: In Make\'92s app list, under \'93Tools\'94 or search \'93HTTP\'94, you\'92ll find modules like HTTP > Make a request, Make a basic auth request, Make an API key auth request, Make an OAuth2 request, etc. They are functionally similar \'96 the main difference is how you authenticate:\
No Auth / Simple Request: You can use HTTP > Get a file (for simple downloads) or the generic HTTP > Make a request for any method. These don\'92t require a connection; just specify the URL, method (GET/POST/PUT/DELETE/etc.), headers, body, etc., each time. Use these for public APIs or endpoints that don\'92t need auth.\
Basic Auth: Use HTTP > Make a basic auth request to conveniently handle Basic HTTP Authentication. When you first use it, click Add to enter the username and password (these are stored as a connection)\
apps.make.com\
. Once saved, you can reuse that Basic Auth connection for subsequent calls\
apps.make.com\
. The module will send the credentials in the Authorization header for you.\
API Key Auth: Use HTTP > Make an API key auth request for APIs that use static tokens/keys. On first use, click Add to create a \'93keychain\'94 (connection) with your API key value\
apps.make.com\
. You can specify whether the key should be sent as an HTTP header or as a URL query parameter, and what the parameter name is\
apps.make.com\
. For example, if an API expects Authorization: Bearer <token>, you\'92d put \'93Bearer <yourToken>\'94 as the key and choose header with name \'93Authorization\'94\
apps.make.com\
. Or if it expects ?api_key=XYZ, you\'92d choose query parameter and name it accordingly. After creating the API key connection, fill in the URL, method, body, etc., similar to any request.\
OAuth 2.0: The HTTP > Make an OAuth 2.0 request module is for APIs using OAuth2 (e.g., many modern SaaS APIs). This requires a more involved setup: you must create an OAuth2 connection in Make which handles the token exchange. When you add this module and click \'93Add Connection\'94 (or \'93Create a connection\'94), you\'92ll need to choose the OAuth grant type (Authorization Code or Implicit) and enter details from the API\'92s developer documentation\
apps.make.com\
apps.make.com\
. Typically, this includes: an Authorize URL, Token URL, Client ID, Client Secret, and scopes\
apps.make.com\
apps.make.com\
. The Redirect URL will usually be pre-filled as https://www.integromat.com/oauth/cb/oauth2 (Make\'92s standard callback URL)\
apps.make.com\
 \'96 you must register this exact URL in the third-party app\'92s OAuth client settings (even though it says integromat.com, it is correct and used by Make)\
help.make.com\
help.make.com\
. After entering the credentials and scopes, Make will open a window to authorize the app (the OAuth login flow). Once authorized, Make stores the tokens. From then on, the HTTP OAuth2 module will attach the access token to every request (header or query as specified)\
apps.make.com\
, and handle refresh tokens automatically when needed. In the module configuration, you just need to provide the endpoint URL, method, headers, body, etc., similar to any HTTP request. Setting up OAuth2 might seem complex, but you only do it once per API. It ensures secure, authorized calls to services like Google, Facebook, etc., if an official Make app isn\'92t available or if you need a custom endpoint beyond what the app modules provide. (If you\'92re comfortable with API specifics, you can also use Make\'92s API call function in some app modules or the Make API itself, but that\'92s beyond this scope.)\
No matter which HTTP module you use, the configuration fields are similar:\
URL \'96 The endpoint you\'92re calling (you can include \{\{mappedFields\}\} or formula in parts of the URL if needed). There\'92s also a \'93Serialize\'94 option to auto-encode query strings if you toggle it\
apps.make.com\
.\
Method \'96 GET, POST, PUT, PATCH, DELETE, etc.\
apps.make.com\
.\
Headers \'96 Any custom headers the request needs (e.g., Content-Type, Accept, etc.)\
apps.make.com\
. Note, the HTTP modules by default do not send an Accept header, so if an API returns something unexpected, try explicitly setting Accept: application/json or whatever is needed\
apps.make.com\
.\
Query String \'96 Key-value pairs to append to the URL as ?key=value parameters (if you prefer not to build them into the URL string)\
apps.make.com\
.\
Body \'96 For POST/PUT/PATCH, you have options like raw, form-data, or URL-encoded bodies\
apps.make.com\
apps.make.com\
. Raw is used for JSON or XML: you can paste or construct the JSON/XML text (and set the Content-Type header accordingly, e.g. application/json). Form Data and WWW Form URL Encoded allow you to build key-value pairs in the module UI. If sending files, use multipart/form-data: the module will let you pick a file from a previous module output or manually upload one\
apps.make.com\
apps.make.com\
.\
Parse Response \'96 As mentioned, you can enable this to have Make auto-parse JSON or XML responses into structured output bundles\
apps.make.com\
. If disabled, the module will return raw text or a file (which you might then pipe to Parse JSON, etc. manually).\
Timeout \'96 You can adjust the timeout (in seconds) for the HTTP call if the default 40s is too short or long\
apps.make.com\
apps.make.com\
.\
Advanced options \'96 There are toggles for things like following redirects (enabled by default for 3xx, with an option to follow all redirects), sending/receiving cookies (you can share cookies between HTTP modules if needed), and SSL options (like providing a client certificate for mutual TLS, or allowing self-signed certificates)\
apps.make.com\
apps.make.com\
. These are only needed in special cases (e.g., calling an internal API that requires a client SSL cert).\
Using these HTTP modules, you can integrate with virtually any web service. For example, suppose you want to connect to a lesser-known CRM\'92s API that Make doesn\'92t have an app for: you could use an HTTP module with API Key auth, set the base URL and endpoints as needed, and then build the scenario logic around those calls. Combine that with the JSON parsing and error handling techniques above, and you have a custom integration built with no actual coding \'96 just configuration.\
Custom Modules and Scripting\
Sometimes you need functionality beyond what\'92s available in built-in modules and formulas. There are a few avenues to extend Make\'92s capabilities:\
Custom App Modules (Developer Platform)\
Make offers a Developer Platform where you can create your own app modules (essentially custom integrations) using their toolkit. This is an advanced topic (involving writing module definitions in a format with JSON/IML and possibly coding the authentication and API calls). Best suited for when you want to integrate a new SaaS product and possibly share it. Key best practices for custom apps include using proper naming, handling connections securely, and thorough testing\
developers.make.com\
developers.make.com\
 \'96 essentially, follow Make\'92s guidelines for app development to ensure the module works reliably. Custom apps can be built via the web editor or using the Make SDK in VS Code\
developers.make.com\
. Details of this are beyond our scope, but know that if you find yourself needing a module that doesn\'92t exist, and you have developer resources, you can build one. For most users, a quicker alternative to a full custom app is to use the HTTP tools as described or use existing generic modules (like the JSON module, Tools modules, etc.) to achieve the needed outcome without formal app development.\
Scripting with Code (Custom Functions)\
Make is a no-code platform, but for enterprise plans it introduced Custom Functions (in 2023) that let you write snippets of JavaScript to perform advanced data processing\
help.make.com\
. Custom Functions are essentially user-defined functions that you can invoke within your scenario\'92s mapping formulas. You write them in the Make Functions section (in the left menu of Make scenario editor). Once saved, they become available in the functions list with a special icon. For example, you could write a function to calculate a checksum, or implement a complex date calculation that isn\'92t covered by built-in functions. These functions use modern JavaScript (ES6) syntax\
help.make.com\
 and can accept parameters and return a value with the return statement\
help.make.com\
. Usage: Suppose you created a custom function named daysBetween(start, end) to calculate the number of days between two dates. In your scenario mapping, you could then do daysBetween(date1; date2) just like a built-in function. This can greatly simplify scenarios that would otherwise need many modules or complicated formulas. Limitations: Custom functions run on Make\'92s servers and have some important constraints. They cannot exceed 300 milliseconds of execution time and 5000 characters of code\
help.make.com\
. They also cannot perform asynchronous operations \'96 meaning no HTTP requests or waiting inside the function\
help.make.com\
. You also cannot import external libraries; you\'92re limited to vanilla JS and the provided environment (some global objects, maybe an iml object for certain utilities like calling Make\'92s built-in funcs inside your code\
help.make.com\
). They should also be free of side effects \'96 they\'92re meant to compute and return a value, not modify state. Recursion is disallowed (no recursive calls) and they cannot call other custom functions\
help.make.com\
. Essentially, they\'92re for calculation and transformation only. If a custom function errors out or returns an invalid result, the scenario will log an error at runtime for that module. One should thoroughly test custom functions using the provided debug console in the editor\
help.make.com\
. The platform keeps version history of your functions, so you can revert if you introduce a bug\
help.make.com\
. It\'92s wise to also document what each function does (Make lets you add a description when creating it). If you are not on an Enterprise plan or otherwise can\'92t use custom functions, an alternative is to use the HTTP module to call out to a serverless function or external service where you can run code. For instance, you could have a small AWS Lambda or Cloud Function endpoint that Make sends data to and which returns the processed result. This is obviously more overhead (maintaining an external service), but can be a workaround for implementing complex logic. Lastly, the community has developed some workarounds like using third-party \'93code\'94 services (for example, there used to be a connector called 0Code or others that allow running Node.js). But with the advent of Custom Functions, most needs can be satisfied in-platform as long as they adhere to the limits. Scripting within modules: Note that a few Make app modules themselves allow scripting \'96 e.g., some Google Workspace modules (Apps Script) or the old \'93Code\'94 module (if it exists) \'96 but those are not commonly used now that custom functions exist. Always consider if a transformation can be done with Make\'92s native functions first (for performance and simplicity) before reaching for custom JS.\
Best Practices for Scalability and Maintainability\
Building complex scenarios is one thing; building them to be robust, scalable, and easy to maintain is another. Here are some key best practices:\
Design modular, focused scenarios: It can be tempting to create one massive scenario that does everything. However, it\'92s often better to break up logic into multiple scenarios that do specific tasks, and have them trigger each other via webhooks or data stores. For example, you might have one scenario dedicated to syncing data from HubSpot to a database, and another for processing that data and sending alerts. Smaller scenarios are easier to understand and troubleshoot. A Make power-user tip is to use webhooks to daisy-chain scenarios (Scenario A ends by calling a webhook that starts Scenario B, etc.) \'96 this allows each to run in its own context and be scheduled/monitored separately. It also helps with scaling, as each scenario can run in parallel if needed, without one big scenario becoming a bottleneck.\
Use routers and filters to avoid unnecessary operations: Place filters early to screen out bundles that don\'92t need processing, so your scenario doesn\'92t waste operations. For instance, if watching HubSpot for contact changes but only ones with a certain property should trigger an action, put a filter on the trigger to drop irrelevant bundles. This makes the scenario more efficient and scalable (especially important if you have a high volume of triggers).\
Enable \'93Incomplete Executions\'94 for critical scenarios: This setting (in scenario settings) lets Make catch failed runs so you can retry them\
help.make.com\
help.make.com\
. For processes where data cannot be lost (orders, invoices, lead handoff, etc.), always enable this. It essentially provides a safety net \'96 any time an error would crash the scenario, the state is saved. You can then inspect and re-run the failed tasks after fixing the issue, ensuring no important data slip through the cracks. It\'92s easier to manage reruns than to manually reconstruct lost transactions.\
Plan for external failures (use error handlers): As covered above, use Ignore or Resume for minor errors, Break or Rollback for major ones. Importantly, notify humans or log errors when something goes wrong. A best practice is to have an error handler route that sends a message (Slack, email, etc.) to an admin or logs details to a Google Sheet or database. This way, issues are visible and can be addressed before they pile up. For example, if an API limit is reached and you use Break, also send a Slack alert with the scenario name and error info so someone can investigate.\
Leverage built-in scheduling and aggregation to manage load: If your scenario processes a lot of data (say thousands of records), consider scheduling it during off-peak hours or using aggregators to batch process. For example, instead of processing one record per API call in real-time, you could collect records for an hour and then process in bulk (if latency requirements allow). Batching can drastically reduce the number of operations and API calls, improving scalability. Make provides scheduling options (from every minute to specific cron-like schedules) to help orchestrate this.\
Monitor scenario usage and performance: Keep an eye on the scenario execution log and Make\'92s Operations usage (especially if you have quotas). If a scenario is running too slowly or hitting the operation limits, consider optimizations like those above. Sometimes adding a filter or a router to split heavy processing into separate paths can improve throughput. Also be mindful of infinite loops (e.g., a scenario that updates a record which triggers itself again). Use safeguards like filters to break such loops, or scenario settings to prevent reruns on the same data.\
Use meaningful naming and documentation: Name your scenarios clearly (e.g., \'93HubSpot to Salesforce Sync \'96 Deals\'94) and do use the description field to outline what it does. Inside the scenario, you can add notes (Create a note module) or at least label modules (each module\'92s name can be edited) to clarify their purpose. This will pay off when you or someone else revisits the scenario in a few months. Additionally, maintain a central document or use Make\'92s module annotation feature to keep track of logic. Since this guide may be used by an AI assistant, having clear structure also helps the AI trace what each part of the scenario is meant to do.\
Test thoroughly with sample data: Before unleashing a complex scenario on live data, use controlled inputs to test each route and edge case. For instance, in the earlier RevOps example, you\'92d test a new lead that meets criteria, one that doesn\'92t, one where the phone call fails, etc., to ensure each branch (router path, error handler) behaves correctly\
o8.agency\
. Use Make\'92s feature to run the scenario with a single bundle or manually supply data to certain modules for unit testing parts of the flow.\
Version control your scenarios (manually if needed): Since Make doesn\'92t have built-in versioning, you can use blueprint exports as a form of version control. Whenever you make major changes, export the blueprint JSON and store it (with a version label or date). This way, you can revert or refer to older logic if something breaks. As noted, some community solutions even script the deployment of blueprints across accounts. At minimum, keeping backups of your automations is wise.\
Keep an eye on deprecations and updates: Make regularly updates apps and sometimes deprecates modules (for example, older HubSpot modules might be marked deprecated in favor of newer ones\
make.com\
). Plan to update your scenarios to use new modules or APIs before old ones shut off. The Make editorial content or release notes can help inform you of such changes.\
Security and compliance: Avoid putting sensitive info directly in scenarios (like hardcoding API keys in plaintext in an HTTP header field \'96 use the connection feature to secure them). Make sure to use Make\'92s privacy features if needed, like locking modules or using the EU datacenter if required. For maintainability, also document any credentials/integrations in a secure document so others know how things are connected, especially if you leave the project.\
By following these practices, you create automations that are not only powerful, but also reliable and maintainable in the long run. Automation is fantastic for productivity, but as scenarios grow in complexity, treating them with the same rigor as software projects \'96 with testing, documentation, and error handling \'96 is crucial. With the knowledge in this guide, an AI assistant (or any proficient user) should be equipped to help design and troubleshoot intricate Make.com scenarios, whether it\'92s integrating a HubSpot tech stack for RevOps or cleaning up thousands of rows of data in a spreadsheet. Happy automating! Sources: The information above is based on Make.com\'92s official documentation and community best practices, including the Make Help Center (for core features and modules)\
help.make.com\
help.make.com\
, Make\'92s Apps & Functions reference\
help.make.com\
apps.make.com\
, and expert insights from Make\'92s community forums and blog posts\
o8.agency\
community.make.com\
.\
Citations\
Favicon\
AI Inbound Sales Automation with Make.com and Other Tools | O8\
\
https://www.o8.agency/blog/ai/ai-inbound-sales-automation-makecom-and-other\
Favicon\
AI Inbound Sales Automation with Make.com and Other Tools | O8\
\
https://www.o8.agency/blog/ai/ai-inbound-sales-automation-makecom-and-other\
Favicon\
Duplicate Entries - How To - Make Community\
\
https://community.make.com/t/duplicate-entries/1207\
Create your first scenario - Help Center\
\
https://help.make.com/create-your-first-scenario\
Favicon\
HubSpot CRM Integration | Workflow Automation | Make\
\
https://www.make.com/en/integrations/hubspotcrm\
Favicon\
HubSpot CRM Integration | Workflow Automation | Make\
\
https://www.make.com/en/integrations/hubspotcrm\
Router - Help Center\
\
https://help.make.com/router\
How to Deploy Make.com Scenarios - Primary Goals\
\
https://primarygoals.com/how-to-deploy-scenarios-for-make-integromat/\
How to Deploy Make.com Scenarios - Primary Goals\
\
https://primarygoals.com/how-to-deploy-scenarios-for-make-integromat/\
How to Deploy Make.com Scenarios - Primary Goals\
\
https://primarygoals.com/how-to-deploy-scenarios-for-make-integromat/\
Router - Help Center\
\
https://help.make.com/router\
Router - Help Center\
\
https://help.make.com/router\
Router - Help Center\
\
https://help.make.com/router\
Router - Help Center\
\
https://help.make.com/router\
Router - Help Center\
\
https://help.make.com/router\
Router - Help Center\
\
https://help.make.com/router\
Flow control - Help Center\
\
https://help.make.com/flow-control\
Flow control - Help Center\
\
https://help.make.com/flow-control\
Flow control - Help Center\
\
https://help.make.com/flow-control\
Flow control - Help Center\
\
https://help.make.com/flow-control\
Flow control - Help Center\
\
https://help.make.com/flow-control\
Flow control - Help Center\
\
https://help.make.com/flow-control\
Flow control - Help Center\
\
https://help.make.com/flow-control\
Aggregator - Help Center\
\
https://help.make.com/aggregator\
Aggregator - Help Center\
\
https://help.make.com/aggregator\
Aggregator - Help Center\
\
https://help.make.com/aggregator\
Aggregator - Help Center\
\
https://help.make.com/aggregator\
Aggregator - Help Center\
\
https://help.make.com/aggregator\
Aggregator - Help Center\
\
https://help.make.com/aggregator\
Aggregator - Help Center\
\
https://help.make.com/aggregator\
Aggregator - Help Center\
\
https://help.make.com/aggregator\
Flow control - Help Center\
\
https://help.make.com/flow-control\
Connect Make to any web service that uses OAuth2 authorization - Help Center\
\
https://help.make.com/connect-make-to-any-web-service-that-uses-oauth2-authorization\
Connect Make to any web service that uses OAuth2 authorization - Help Center\
\
https://help.make.com/connect-make-to-any-web-service-that-uses-oauth2-authorization\
HTTP - Apps Documentation\
\
https://apps.make.com/http\
Array functions - Help Center\
\
https://help.make.com/array-functions\
Array functions - Help Center\
\
https://help.make.com/array-functions\
Array functions - Help Center\
\
https://help.make.com/array-functions\
Array functions - Help Center\
\
https://help.make.com/array-functions\
Array functions - Help Center\
\
https://help.make.com/array-functions\
Overview of error handling - Help Center\
\
https://help.make.com/overview-of-error-handling\
Overview of error handling - Help Center\
\
https://help.make.com/overview-of-error-handling\
Overview of error handling - Help Center\
\
https://help.make.com/overview-of-error-handling\
Overview of error handling - Help Center\
\
https://help.make.com/overview-of-error-handling\
Quick error handling reference - Help Center\
\
https://help.make.com/quick-error-handling-reference\
Quick error handling reference - Help Center\
\
https://help.make.com/quick-error-handling-reference\
Quick error handling reference - Help Center\
\
https://help.make.com/quick-error-handling-reference\
Quick error handling reference - Help Center\
\
https://help.make.com/quick-error-handling-reference\
Quick error handling reference - Help Center\
\
https://help.make.com/quick-error-handling-reference\
Quick error handling reference - Help Center\
\
https://help.make.com/quick-error-handling-reference\
Quick error handling reference - Help Center\
\
https://help.make.com/quick-error-handling-reference\
Quick error handling reference - Help Center\
\
https://help.make.com/quick-error-handling-reference\
Overview of error handling - Help Center\
\
https://help.make.com/overview-of-error-handling\
Overview of error handling - Help Center\
\
https://help.make.com/overview-of-error-handling\
Webhooks - Apps Documentation\
\
https://apps.make.com/gateway\
Webhooks - Apps Documentation\
\
https://apps.make.com/gateway\
Webhooks - Apps Documentation\
\
https://apps.make.com/gateway\
Webhooks - Apps Documentation\
\
https://apps.make.com/gateway\
Webhooks - Apps Documentation\
\
https://apps.make.com/gateway\
Webhooks - Apps Documentation\
\
https://apps.make.com/gateway\
Webhooks - Apps Documentation\
\
https://apps.make.com/gateway\
Webhooks - Apps Documentation\
\
https://apps.make.com/gateway\
Webhooks - Apps Documentation\
\
https://apps.make.com/gateway\
Webhooks - Apps Documentation\
\
https://apps.make.com/gateway\
Webhooks - Apps Documentation\
\
https://apps.make.com/gateway\
Webhooks - Apps Documentation\
\
https://apps.make.com/gateway\
Webhooks - Apps Documentation\
\
https://apps.make.com/gateway\
Webhooks - Apps Documentation\
\
https://apps.make.com/gateway\
Webhooks - Apps Documentation\
\
https://apps.make.com/gateway\
Webhooks - Apps Documentation\
\
https://apps.make.com/gateway\
Webhooks - Apps Documentation\
\
https://apps.make.com/gateway\
Webhooks - Apps Documentation\
\
https://apps.make.com/gateway\
HTTP - Apps Documentation\
\
https://apps.make.com/http\
HTTP - Apps Documentation\
\
https://apps.make.com/http\
HTTP - Apps Documentation\
\
https://apps.make.com/http\
HTTP - Apps Documentation\
\
https://apps.make.com/http\
HTTP - Apps Documentation\
\
https://apps.make.com/http\
HTTP - Apps Documentation\
\
https://apps.make.com/http\
HTTP - Apps Documentation\
\
https://apps.make.com/http\
Connect Make to any web service that uses OAuth2 authorization - Help Center\
\
https://help.make.com/connect-make-to-any-web-service-that-uses-oauth2-authorization\
Connect Make to any web service that uses OAuth2 authorization - Help Center\
\
https://help.make.com/connect-make-to-any-web-service-that-uses-oauth2-authorization\
HTTP - Apps Documentation\
\
https://apps.make.com/http\
HTTP - Apps Documentation\
\
https://apps.make.com/http\
HTTP - Apps Documentation\
\
https://apps.make.com/http\
HTTP - Apps Documentation\
\
https://apps.make.com/http\
HTTP - Apps Documentation\
\
https://apps.make.com/http\
HTTP - Apps Documentation\
\
https://apps.make.com/http\
HTTP - Apps Documentation\
\
https://apps.make.com/http\
HTTP - Apps Documentation\
\
https://apps.make.com/http\
HTTP - Apps Documentation\
\
https://apps.make.com/http\
HTTP - Apps Documentation\
\
https://apps.make.com/http\
HTTP - Apps Documentation\
\
https://apps.make.com/http\
Favicon\
Best practices | Make Developer Hub\
\
https://developers.make.com/custom-apps-documentation/best-practices\
Favicon\
Best practices | Make Developer Hub\
\
https://developers.make.com/custom-apps-documentation/best-practices\
Favicon\
Best practices | Make Developer Hub\
\
https://developers.make.com/custom-apps-documentation/best-practices\
Custom functions - Help Center\
\
https://help.make.com/custom-functions\
Custom functions - Help Center\
\
https://help.make.com/custom-functions\
Custom functions - Help Center\
\
https://help.make.com/custom-functions\
Custom functions - Help Center\
\
https://help.make.com/custom-functions\
Custom functions - Help Center\
\
https://help.make.com/custom-functions\
Custom functions - Help Center\
\
https://help.make.com/custom-functions\
Custom functions - Help Center\
\
https://help.make.com/custom-functions\
Custom functions - Help Center\
\
https://help.make.com/custom-functions\
Custom functions - Help Center\
\
https://help.make.com/custom-functions\
Overview of error handling - Help Center\
\
https://help.make.com/overview-of-error-handling\
Favicon\
AI Inbound Sales Automation with Make.com and Other Tools | O8\
\
https://www.o8.agency/blog/ai/ai-inbound-sales-automation-makecom-and-other\
Favicon\
HubSpot CRM Integration | Workflow Automation | Make\
\
https://www.make.com/en/integrations/hubspotcrm}