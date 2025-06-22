# User Personas for n8n Ultimate

This document outlines the key user personas for the n8n Ultimate platform. These personas guide our UX design, feature development, and testing strategies.

---

## 1. Brenda, the Business Automator

- **Role:** Marketing Operations Manager at a mid-sized SaaS company.
- **Technical Skill:** Low-code enthusiast. Comfortable with Zapier, Make.com, and basic spreadsheet formulas. Not a programmer.
- **Primary Goal:** To automate repetitive marketing and sales tasks quickly and reliably without waiting for engineering resources.
- **Key Scenarios:**
    - "When a new lead comes in from a HubSpot form, add them to a Mailchimp list, and send a notification to a Slack channel."
    - "Every Monday, pull a report of new customers from Stripe and update a Google Sheet for the sales team."
- **Success Metrics:**
    - **Time to First Workflow:** How quickly can she build and activate a simple, multi-step workflow? (Target: < 15 minutes)
    - **Error Rate:** How often do her workflows fail due to configuration issues vs. external API problems?
    - **Autonomy:** Can she build 90% of her desired workflows without needing technical support?
- **Pain Points:**
    - Confusing technical jargon (e.g., "webhooks," "JSON parsing").
    - Debugging when something goes wrong.
    - Hitting API rate limits without understanding why.
- **What She Needs from n8n Ultimate:**
    - **Guided Generation:** A wizard-like experience that translates her plain-English descriptions into a functional workflow.
    - **Clear Error Messages:** Simple, actionable feedback when a node fails.
    - **Pre-built Templates:** A gallery of common use cases she can adapt.

---

## 2. Paul, the Rapid Prototyper

- **Role:** Full-stack developer at a startup.
- **Technical Skill:** High. Proficient in JavaScript/TypeScript, Python, and comfortable with APIs, databases, and Docker.
- **Primary Goal:** To build and test new product ideas and internal tools as quickly as possible. Sees n8n as a "super-glue" for APIs.
- **Key Scenarios:**
    - "I need to quickly build a backend for a new feature that connects to a new AI model, a Postgres database, and our internal user API."
    - "Let's A/B test two different lead-scoring workflows to see which one converts better."
- **Success Metrics:**
    - **Flexibility:** Can he drop down into code when a pre-built node isn't sufficient?
    - **Performance:** Can the workflows handle a reasonable load for prototyping and internal use?
    - **Extensibility:** How easy is it to add new, custom nodes or connect to unsupported APIs?
- **Pain Points:**
    - Rigid, "black box" platforms that don't allow for custom logic.
    - Lack of version control for his automations.
    - Poor performance when processing large amounts of data.
- **What He Needs from n8n Ultimate:**
    - **Expert Mode:** A command palette and keyboard shortcuts for fast workflow creation.
    - **Code Node & Custom Nodes:** The ability to write custom JavaScript and easily import his own node definitions.
    - **Versioning & A/B Testing:** Tools to manage changes and experiment with different workflow approaches.
    - **Performance Dashboards:** Visibility into execution times and resource usage. 