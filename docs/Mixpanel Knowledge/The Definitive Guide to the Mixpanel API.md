The Definitive Guide to the Mixpanel API for Data Export and Integration


Part 1: Foundational Concepts for Mixpanel API Integration

This section establishes the core knowledge required for programmatic interaction with Mixpanel. It provides the foundational context necessary for building robust and effective data integrations, particularly for automated systems and AI agents.

## Section 1.1: The Mixpanel API Ecosystem: An Architectural Overview

A common misconception is that Mixpanel offers a single, monolithic API. In reality, it provides a suite of specialized, REST-based APIs, each designed for a specific function. Understanding the role of each API is the first step toward successful integration. All API calls must be made over HTTPS to ensure the security of request and response data.1
The primary APIs relevant to data export and integration are:
Ingestion API: This API is used for sending data to Mixpanel. It consists of two main endpoints: /track for real-time events, typically from client-side SDKs (limited to ingesting events from the last 5 days), and /import for server-side batch and historical data imports (accepting events from any time). The quality and structure of the data you export are directly dependent on how it was ingested.
Query API: This API allows you to retrieve calculated and formatted data that mirrors the reports available in the Mixpanel web application. It is the primary tool for accessing user profiles (via the /engage endpoint), aggregated event data, and report results like segmentation, funnels, and retention analyses.
Raw Data Export API: This API is designed for retrieving raw, unprocessed event data in bulk. It is the ideal solution for large-scale data dumps intended for analysis in external systems, data warehouses, or for archiving purposes.
Supporting APIs: Other specialized APIs exist to manage the Mixpanel environment programmatically. These include the Lexicon Schemas API for managing your data dictionary, the GDPR API for handling data subject access and deletion requests, and the Service Accounts API for managing authentication credentials.
The distinction between the Query API and the Raw Data Export API is fundamental to any data export strategy. The Query API provides answers—such as "What are the properties of the user with this ID?" or "How many users performed 'Purchase' last week?". The Raw Data Export API, in contrast, provides the raw material—for example, "Give me every single event that occurred yesterday."
This architectural split has direct implications for complex workflows. For instance, to sync data from a user in HubSpot to another system using a shared customer ID, a two-step process is required. First, the Query API's /engage endpoint must be used to find the Mixpanel user profile corresponding to the HubSpot customer ID and retrieve their canonical Mixpanel identifier. Second, the Raw Data Export API can be used with that identifier to pull the user's complete, raw event history. An automated agent must be able to classify the type of data required—aggregated/profile vs. raw/bulk—to select the correct API endpoint for each task.

## Section 1.2: Core Data & Identity Models: Events, Profiles, and distinct_id

Mixpanel's data model revolves around three core objects: Events, User Profiles, and Group Profiles. At the heart of connecting these objects is Mixpanel's identity management system, which is paramount for any integration that seeks to link user data across platforms.
The system hinges on two key identifiers sent with events:
$device_id: An anonymous identifier automatically generated by Mixpanel's client-side SDKs. It represents a specific device or browser before a user has been identified.
$user_id: A known identifier that you assign to a user, typically after they log in or sign up. This should be a stable, unique ID from your own database, such as a primary key or, in this case, the customer ID from HubSpot.
The connection between these two IDs is forged by the .identify() method. When you call .identify(<user_id>) in a Mixpanel SDK, Mixpanel creates a mapping between the current $device_id and the provided $user_id. This action merges their event streams into a single "identity cluster." Subsequently, Mixpanel establishes a canonical distinct_id for the user, which is the $user_id you provided. All future API queries and data exports will rely on this canonical distinct_id to reference the user.
This mechanism is the lynchpin for the entire HubSpot integration. For the customer ID to be a viable link between the two systems, it is a critical prerequisite that the Mixpanel tracking implementation calls .identify() and passes the HubSpot customer ID as the $user_id. If this step is not correctly implemented during data ingestion, there will be no reliable way to find a user in Mixpanel based on their HubSpot ID, rendering the export workflow impossible. This highlights the deep connection between a sound tracking strategy and the capabilities of data export.

## Section 1.3: Authentication for Server-Side Integration: The Service Account Standard

For secure, server-to-server API communication, Mixpanel's recommended authentication method is the Service Account. This method supersedes older, less secure mechanisms.
Service Accounts (Recommended): A Service Account is a non-human user that can be granted specific, role-based permissions for various projects within your organization.1 Authentication is performed via HTTP Basic Auth, using the Service Account's
username as the username and its secret as the password.1
Deprecated Methods: You may encounter documentation or legacy code that uses a Project Secret. This method is being deprecated because it provides full, non-granular access to a single project and is less secure than the Service Account model.1
A subtle but critical detail arises from the architectural difference between these methods. A Project Secret is inherently tied to a single project. A Service Account, however, is a user-like entity that can have access to multiple projects. Because of this, when you authenticate using a Service Account, you must specify which project you are targeting by including the project_id as a query parameter in your API request. This tells Mixpanel the context for your request. Failure to include the project_id is a common source of authentication errors when using Service Accounts.
The logic for an automated system is therefore clear: if the authentication method is a Service Account, the project_id parameter is mandatory for the API call to succeed.
Table 1: Authentication Method Comparison
| Method | Recommended Use Case | Key Credentials | Deprecation Status | project_id Required? |
| :--- | :--- | :--- | :--- | :--- |
| Service Account | All server-to-server API calls (Query, Export, etc.) | username, secret | Recommended Standard | Yes |
| Project Secret | Legacy server-side scripts | secret | Deprecating | No |
| Project Token | Client-side data ingestion (/track) | token | N/A (for ingestion) | No |

Part 2: Methodologies for Data Export

This part provides a practical guide to the two primary APIs for extracting data from Mixpanel, detailing their specific endpoints and parameters.

## Section 2.1: Choosing Your Export Method: Query API vs. Raw Export API

The choice between the Query API and the Raw Export API depends entirely on the nature of the data you need to retrieve.
Use the Query API (/engage) when you need:
Targeted lookups of specific user or group profiles.
The current state of a user's properties (e.g., their current subscription plan, last login date).
Aggregated metrics that replicate a Mixpanel report (e.g., segmentation counts, funnel conversion rates).
The data is returned as a structured JSON object, often paginated.
Use the Raw Export API (/export) when you need:
A bulk export of all raw, immutable event logs for a given time period.
A complete activity stream for a user or set of users for offline analysis or data warehousing.
The data is returned as JSONL (JSON Lines), where each line is a separate JSON object representing an event, which is ideal for streaming and processing large datasets.
A simple decision process is as follows:
Do I need to find a user based on their properties? -> Use the Query API (/engage).
Do I have a user's distinct_id and need all their historical actions? -> Use the Raw Export API (/export).
Do I need data that looks like a Mixpanel report? -> Use the Query API (e.g., /segmentation, /funnels).

## Section 2.2: The Raw Event Export API (/export): A Deep Dive

The Raw Event Export API provides access to the raw event data as it is stored in Mixpanel. The primary endpoint is GET https://data.mixpanel.com/api/2.0/export (or https://data-eu.mixpanel.com/... for EU data residency).
The output is in JSONL format, meaning the response body is a series of JSON objects separated by newlines, not a single large JSON array. This format is highly efficient for processing large volumes of data.
A key nuance is how the API interprets the from_date and to_date parameters. For projects created after January 1, 2023, these dates are interpreted in UTC. For older projects, they are interpreted in the project's configured timezone.
Table 2: /export API Parameters
| Parameter | Data Type | Required? | Description | Example Value |
| :--- | :--- | :--- | :--- | :--- |
| project_id | integer | If using Service Account | The ID of the project to query. | 1234567 |
| from_date | string | Yes | Start date of the export range (YYYY-MM-DD), inclusive. | 2024-01-01 |
| to_date | string | Yes | End date of the export range (YYYY-MM-DD), inclusive. | 2024-01-31 |
| limit | integer | No | Maximum number of events to return. Max value is 100,000. | 10000 |
| event | string | No | A JSON-encoded array of event names to filter by. | `` |
| where | string | No | An expression to filter events by properties. | properties["Plan"] == "Premium" |
| time_in_ms | boolean | No | If true, exports timestamps with millisecond precision. Defaults to false (second precision). | true |
Source:

## Section 2.3: The Query API for User Profiles (/engage): A Deep Dive

The Engage endpoint of the Query API is the tool for querying Mixpanel's user profile database. It allows you to retrieve a list of users and their associated properties based on specific criteria. The endpoint is POST https://mixpanel.com/api/query/engage.
This endpoint is fundamentally paginated. A single request will not return all matching profiles if the result set is large. Correctly handling this pagination is essential for retrieving complete data, a process detailed in Part 4 of this guide.
Table 3: Key /engage API Parameters
| Parameter | Data Type | Required? | Description | Example Value |
| :--- | :--- | :--- | :--- | :--- |
| project_id | integer | If using Service Account | The ID of the project to query. | 1234567 |
| where | string | No | An expression to filter users by their profile properties. | user["$country_code"] == "US" |
| distinct_ids | string | No | A JSON-encoded array of distinct_id values to retrieve specific profiles for. | ["user123", "user456"] |
| output_properties| array of strings | No | A JSON-encoded array of property names to return. Drastically improves performance. | `` |
| filter_by_cohort | string | No | A JSON object specifying a cohort ID to filter by. | {"id":54321} |
| session_id | string | For pagination | The session ID from a previous query response, used to retrieve subsequent pages. | 123...abc |
| page | integer | For pagination | The page number to retrieve (starts at 0). Requires session_id. | 1 |
Source:

Part 3: Mastering Data Filtering with Segmentation Expressions

The where parameter is the most powerful feature for targeted data export, available in both the /export and /engage APIs. It uses a proprietary SQL-like expression language to filter data based on event or user properties.

## Section 3.1: The where Parameter and Expression Syntax

The core of the expression syntax involves referencing properties and applying operators. The syntax for referencing properties differs based on whether you are filtering events or users:
Event Properties: properties["<property_name>"]
User Properties: user["<property_name>"] (Used only in the /engage API)
These can be combined using logical operators (and, or), comparison operators (==, !=, >, <), and the substring operator (in). The language also supports different data types (string, number, boolean) and requires explicit typecasting for comparisons where necessary. For date and time comparisons, values must be wrapped in the datetime() function or formatted as an ISO 8601 string YYYY-MM-DDTHH:MM:SS.
One non-obvious but critical rule concerns the distinct_id property. While it appears as distinct_id in the raw data, when filtering on it within a where expression, it must be referenced with a dollar sign prefix: properties["$distinct_id"]. This is a special case that applies only to this specific property. Ignoring this rule will lead to queries that fail silently or return no results.

## Section 3.2: Practical Filtering Recipes for Make.com Integration

The following recipes provide concrete, ready-to-use examples for the user's integration scenario.
Recipe 1: Finding a User by Custom customer_id (The Core Task)
Goal: Find a Mixpanel user profile using the customer ID from HubSpot.
API Endpoint: POST /api/query/engage
where expression: user["customer_id"] == "HUBSPOT_CUSTOMER_ID_123"
Explanation: This query targets the /engage user profile endpoint and filters for a profile where the custom property named customer_id matches the value provided by HubSpot.
Recipe 2: Exporting All Events for a Specific User
Goal: After finding the user's distinct_id with Recipe 1, export all of their raw events.
API Endpoint: GET /api/2.0/export
where expression: properties["$distinct_id"] == "MIXPANEL_DISTINCT_ID_FROM_RECIPE_1"
Explanation: This query targets the /export raw data endpoint. It uses the special $distinct_id syntax to filter the event stream down to only events associated with the user found in the previous step.
Recipe 3: Combining Filters
Goal: Export events for a specific user on a specific plan who used a specific operating system.
API Endpoint: GET /api/2.0/export
where expression: properties["$distinct_id"] == "user123" and properties == "Premium" and properties["$os"] == "iOS"
Explanation: This demonstrates how to chain multiple conditions together using the and operator to create highly specific filters.
Recipe 4: Filtering by Date Properties
Goal: Find all users who were last active after the start of 2024.
API Endpoint: POST /api/query/engage
where expression: user["$last_seen"] > datetime("2024-01-01T00:00:00")
Explanation: This shows the correct way to filter based on a datetime property ($last_seen). The date string must be in ISO 8601 format and wrapped in the datetime() function for proper comparison.

Part 4: Operational Best Practices for Robust Integration

Building a reliable integration requires more than just correct API calls. It demands robust engineering practices for handling rate limits, pagination, and errors.

## Section 4.1: Navigating API Rate Limits

Mixpanel enforces rate limits to ensure system stability. Exceeding these limits will result in an HTTP 429 Too Many Requests error. Understanding and respecting these limits is crucial.
Table 4: Consolidated API Rate Limits for Export
| API | Limit Type | Value |
| :--- | :--- | :--- |
| Query API | Concurrent Queries | 5 |
| | Queries per Hour | 60 |
| Raw Data Export API | Concurrent Queries | 100 |
| | Queries per Hour | 60 |
| | Queries per Second | 3 |
| Ingestion API | Throughput | 2GB uncompressed JSON/min (~30k events/sec) |
Source:
When a 429 error is received, the correct response is not to fail, but to retry using an exponential backoff with jitter strategy. This prevents a thundering herd problem and allows the system to recover gracefully. A recommended algorithm is:
Upon receiving an HTTP 429 response, initiate a wait period.
Calculate the wait time using the formula: wait=(2retry_attempt×1000)+random_jitter_ms. The retry_attempt starts at 0. The jitter should be a small random number (e.g., between 0 and 1000 ms).
After waiting, retry the request.
If the request fails again, increment retry_attempt and repeat the process.
Cap the maximum backoff time (e.g., at 60 seconds) to prevent excessively long waits.
Abandon the request after a predefined number of retries (e.g., 5-10 attempts) to avoid infinite loops.

## Section 4.2: Handling Pagination and Large Datasets

Different APIs require different strategies for handling large result sets.
For the /engage API (Pagination): This API uses a cursor-based pagination system. To retrieve a complete dataset, you must implement the following loop 2:
Make the initial request with your where filter.
Process the results array from the response.
Check if results.length is equal to the page_size returned in the response.
If it is, there may be more data. Make a subsequent request using the same where filter, but now include the session_id from the previous response and set the page parameter to previous_page + 1.
Repeat until a response is received where results.length is less than page_size.
For the /export API (Chunking): This API is not paginated with a cursor. It is designed to stream data for a given date range. To handle very large datasets (e.g., months or years of data), the best practice is to break the export into smaller, manageable chunks. Instead of one request for a 30-day period, make 30 sequential requests, one for each day. This "date chunking" approach prevents API timeouts and reduces the memory footprint on the client-side, making the process more reliable.

## Section 4.3: A Guide to API Error Codes and Responses

A robust integration must be able to distinguish between different types of errors and react appropriately. The most critical distinction is between retryable and non-retryable errors.
Retrying a non-retryable error, such as a 400 Bad Request, is futile because the request itself is flawed. It will fail every time and needlessly consume your API rate limit quota. In contrast, retryable errors like 429 or 503 are temporary and should be retried.
For debugging 400 errors on the /import endpoint, it is highly recommended to use the strict=1 parameter. This forces the API to perform validation and return a detailed JSON response describing exactly which fields in which events are invalid, complete with their $insert_id for easy identification.
Table 5: Common HTTP Status Codes and Resolutions
| Code | Meaning | Is Retryable? | Recommended Action |
| :--- | :--- | :--- | :--- |
| 200 OK | Success | No | Process the response body. |
| 400 Bad Request | Invalid request syntax or data. | No | Log the error response. Fix the request payload or parameters. Do not retry. |
| 401 Unauthorized | Invalid credentials. | No | Check your Service Account username/secret and project_id. Do not retry. |
| 403 Forbidden | Insufficient permissions. | No | Verify the Service Account has the correct role for the project. Do not retry. |
| 429 Too Many Requests| Rate limit exceeded. | Yes | Implement exponential backoff with jitter and retry the request. |
| 502/503 | Server-side error. | Yes | A temporary issue on Mixpanel's side. Implement exponential backoff and retry. |
Source:

Part 5: Applied Integration: A Workflow for Make.com and HubSpot

This section synthesizes the preceding concepts into a concrete workflow for the specific use case of connecting HubSpot and Mixpanel via a platform like Make.com.

## Section 5.1: Conceptual Workflow: From HubSpot customer ID to Mixpanel Events

The high-level logic for a Make.com scenario that syncs data based on a HubSpot user is as follows:
Trigger: The workflow begins in Make.com, triggered by an event in HubSpot (e.g., "New Contact" or "Updated Contact"). The customer ID from the HubSpot record is extracted.
Find User in Mixpanel: An HTTP module in Make.com sends a POST request to the Mixpanel /engage API. The request body contains a where parameter filtering for user["customer_id"] == "THE_ID_FROM_STEP_1". Authentication is handled using a Service Account and the project_id is included.
Extract distinct_id: The JSON response from Step 2 is parsed. The canonical distinct_id is extracted from the results array (e.g., results.$distinct_id). If the array is empty, the user does not exist in Mixpanel, and the workflow can terminate.
Export Events from Mixpanel: A second HTTP module sends a GET request to the Mixpanel /export API. The request URL includes a where parameter filtering for properties["$distinct_id"] == "THE_ID_FROM_STEP_3". A relevant date range (from_date, to_date) must also be provided.
Process Data: The JSONL data returned from Step 4 is now available within the Make.com scenario. It can be parsed line-by-line, transformed, and used to update other systems, populate a database, or be passed to an AI agent for further analysis.

## Section 5.2: Example API Call Sequence (cURL)

The following cURL commands provide a testable implementation of the key steps in the workflow.
Step 2: Find the user's distinct_id using their customer_id

Bash


# This call queries the user profile database to find the Mixpanel user
# who has a 'customer_id' property matching the one from HubSpot.

curl --request POST \
     --url 'https://mixpanel.com/api/query/engage?project_id=YOUR_PROJECT_ID' \
     --user 'YOUR_SERVICE_ACCOUNT_USERNAME:YOUR_SERVICE_ACCOUNT_SECRET' \
     --header 'accept: application/json' \
     --header 'content-type: application/x-www-form-urlencoded' \
     --data 'where=user["customer_id"] == "hubspot-user-12345"&output_properties=["$distinct_id"]'


Step 4: Export events for that user's distinct_id

Bash


# Assuming the previous call returned a distinct_id, this call exports all raw
# events for that user within the specified date range.

curl --request GET \
     --url 'https://data.mixpanel.com/api/2.0/export?from_date=2024-01-01&to_date=2024-01-31&where=properties["$distinct_id"]%20%3D%3D%20"MIXPANEL_DISTINCT_ID_FROM_PREVIOUS_STEP"' \
     --user 'YOUR_SERVICE_ACCOUNT_USERNAME:YOUR_SERVICE_ACCOUNT_SECRET' \
     --header 'accept: text/plain'


Note: The where parameter in the GET request URL must be URL-encoded. For example, == becomes %3D%3D and spaces become %20.

## Conclusions and Recommendations

Successfully integrating with Mixpanel's APIs for data export hinges on a few core principles.
Identity Management is Foundational: The entire process of linking external systems like HubSpot to Mixpanel depends on a correctly implemented identity management strategy during data ingestion. The customer ID must be consistently passed to Mixpanel's .identify() method to create the necessary link.
Select the Right API for the Job: The architectural separation of the Query API (for answers and profiles) and the Raw Data Export API (for bulk event logs) dictates a multi-step approach for most complex tasks. One must first use the Query API to find the user, then the Export API to retrieve their data.
Adopt Modern Authentication: Service Accounts are the secure, flexible, and recommended standard for all server-side integrations. Their use necessitates including the project_id in API calls, a critical detail for successful authentication.
Build for Resilience: Production-grade integrations must be designed to handle the realities of a distributed system. This requires robust, automated handling of API rate limits through exponential backoff, correct implementation of pagination or date chunking for large datasets, and intelligent error handling that distinguishes between retryable and non-retryable failures.
By internalizing these principles and leveraging the specific recipes and best practices detailed in this guide, developers and automation platforms can build powerful, reliable, and scalable data export workflows with Mixpanel.
Works cited
Authentication Methods - Mixpanel APIs, accessed June 17, 2025, https://developer.mixpanel.com/reference/authentication
Query Profiles - Mixpanel APIs, accessed June 17, 2025, https://developer.mixpanel.com/reference/engage-query