# 🔐 **HubSpot → Mixpanel Integration Credential Setup**

This guide walks you through configuring all the required credentials for your HubSpot to Mixpanel integration workflow.

## **📋 Prerequisites**

- HubSpot account with CRM access
- Mixpanel project with Service Account
- n8n instance (cloud or self-hosted)
- Admin permissions for both platforms

---

## **🏢 HubSpot Credentials Setup**

### **Method 1: Private App (Recommended)**

1. **Go to HubSpot Settings**
   - Navigate to Settings → Integrations → Private Apps
   - Click "Create a private app"

2. **Configure App Details**
   ```
   App Name: n8n Mixpanel Integration
   Description: Sync contact data with Mixpanel analytics
   ```

3. **Set Required Scopes**
   ```
   CRM Scopes:
   ✅ crm.objects.contacts.read
   ✅ crm.objects.contacts.write
   ✅ crm.schemas.contacts.read
   ```

4. **Create & Copy Token**
   - Click "Create app"
   - Copy the generated access token
   - **Store securely** - you won't see this again!

### **Method 2: OAuth App (For Multi-Account)**

1. **Create OAuth App**
   - Go to Settings → Integrations → Connected Apps
   - Click "Create app"

2. **Configure OAuth Settings**
   ```
   Redirect URL: https://your-n8n-instance.com/rest/oauth2-credential/callback
   Scopes: Same as Private App above
   ```

### **🔧 In n8n: Configure HubSpot Credential**

1. **Go to Credentials**
   - Navigate to Settings → Credentials
   - Click "Create New Credential"

2. **Select HubSpot API**
   - Choose "HubSpot API" from the list
   - Name: `HubSpot API Credentials`

3. **Enter Your Token**
   ```
   Access Token: [Your Private App Token]
   ```

4. **Test Connection**
   - Click "Test" to verify
   - Should show "Connection successful"

---

## **📊 Mixpanel Credentials Setup**

### **Step 1: Create Service Account**

1. **Go to Mixpanel Project Settings**
   - Navigate to your Mixpanel project
   - Click Settings → Project Settings

2. **Create Service Account**
   - Go to "Service Accounts" tab
   - Click "Create Service Account"
   
3. **Configure Permissions**
   ```
   Name: n8n HubSpot Integration
   Permissions:
   ✅ Read - Events
   ✅ Read - People
   ✅ Read - Engage
   ```

4. **Generate Credentials**
   - Click "Create"
   - Copy the **Username** and **Secret**
   - **Store securely** - you won't see the secret again!

### **Step 2: Get Project ID**

1. **Find Project ID**
   - In Mixpanel, go to Settings → Project Settings
   - Copy the **Project ID** (usually a number like `12345`)

### **🔧 In n8n: Configure Mixpanel Credential**

1. **Create HTTP Basic Auth**
   - Go to Settings → Credentials
   - Click "Create New Credential"
   - Choose "HTTP Basic Auth"

2. **Enter Service Account Details**
   ```
   Name: Mixpanel Service Account
   Username: [Service Account Username]
   Password: [Service Account Secret]
   ```

3. **Test Connection**
   - Use the test node in the workflow
   - Should return 200 status

---

## **🌍 Environment Variables**

### **Set Mixpanel Project ID**

Add this to your n8n environment variables:

**For n8n Cloud:**
```
MIXPANEL_PROJECT_ID=your_project_id_here
```

**For Self-Hosted n8n:**
```bash
# Add to your .env file or docker-compose.yml
MIXPANEL_PROJECT_ID=your_project_id_here
```

**For Docker:**
```yaml
environment:
  - MIXPANEL_PROJECT_ID=your_project_id_here
```

---

## **🔄 Workflow Configuration**

### **Update Credential References**

In your workflow JSON, ensure these credential IDs match:

```json
{
  "credentials": {
    "hubspotApi": {
      "id": "hubspot-credentials",
      "name": "HubSpot API Credentials"
    }
  }
}
```

```json
{
  "credentials": {
    "httpBasicAuth": {
      "id": "mixpanel-service-account", 
      "name": "Mixpanel Service Account"
    }
  }
}
```

---

## **📝 HubSpot Custom Properties**

### **Create Required Custom Properties**

You'll need to create these custom properties in HubSpot:

1. **Go to Properties Settings**
   - Settings → Properties → Contact Properties
   - Click "Create property"

2. **Create These Properties:**

```
Property 1:
Internal name: customer_id
Label: Customer ID  
Type: Single-line text
Description: Unique identifier for Mixpanel matching

Property 2:
Internal name: mixpanel_page_views
Label: Mixpanel Page Views (30d)
Type: Number
Description: Page views from Mixpanel (last 30 days)

Property 3:
Internal name: mixpanel_unique_pages
Label: Mixpanel Unique Pages (30d)
Type: Number
Description: Unique pages viewed (last 30 days)

Property 4:
Internal name: mixpanel_last_page_view
Label: Last Page View
Type: Date picker
Description: Timestamp of last page view

Property 5:
Internal name: mixpanel_sync_date
Label: Mixpanel Sync Date
Type: Date picker
Description: Last sync with Mixpanel
```

---

## **🧪 Testing Your Setup**

### **Test Credentials**

1. **Test HubSpot Connection**
   ```bash
   curl -H "Authorization: Bearer YOUR_HUBSPOT_TOKEN" \
        "https://api.hubapi.com/crm/v3/objects/contacts?limit=1"
   ```

2. **Test Mixpanel Connection**
   ```bash
   curl -u "USERNAME:SECRET" \
        "https://mixpanel.com/api/2.0/engage?project_id=YOUR_PROJECT_ID"
   ```

### **Run Workflow Test**

1. **Import Workflow**
   - Copy the workflow JSON
   - Import into n8n

2. **Configure Credentials**
   - Update credential references
   - Test each connection

3. **Execute Manually**
   - Click "Execute Workflow"
   - Check execution log for errors

---

## **🚨 Troubleshooting**

### **Common Issues**

**HubSpot "Unauthorized" Error:**
```
❌ Error: 401 Unauthorized
✅ Solution: Check your Private App token and scopes
```

**Mixpanel "Invalid credentials" Error:**
```
❌ Error: Invalid Service Account credentials
✅ Solution: Regenerate Service Account credentials
```

**Missing Customer ID:**
```
❌ Error: customer_id is empty
✅ Solution: Ensure HubSpot contacts have the customer_id field populated
```

**Rate Limiting:**
```
❌ Error: 429 Too Many Requests
✅ Solution: Reduce batch size or add delays between requests
```

### **Debug Steps**

1. **Check Logs**
   - Review n8n execution logs
   - Look for specific error messages

2. **Test Individual Nodes**
   - Execute nodes one by one
   - Verify data flow between nodes

3. **Validate Data**
   - Check HubSpot contact data format
   - Verify Mixpanel project ID

---

## **🔒 Security Best Practices**

### **Credential Security**

- **Never commit credentials to version control**
- **Use environment variables for sensitive data**
- **Rotate credentials regularly**
- **Use dedicated service accounts**
- **Limit permissions to minimum required**

### **Access Control**

- **Restrict workflow access to authorized users**
- **Use separate credentials for dev/staging/prod**
- **Monitor API usage and unusual activity**
- **Set up alerts for failed authentications**

---

## **📞 Support Resources**

### **Documentation**
- [HubSpot API Documentation](https://developers.hubspot.com/docs/api/overview)
- [Mixpanel API Documentation](https://developer.mixpanel.com/reference/overview)
- [n8n Credentials Guide](https://docs.n8n.io/credentials/)

### **Community**
- [n8n Community Forum](https://community.n8n.io/)
- [HubSpot Developer Community](https://community.hubspot.com/t5/HubSpot-Developers/ct-p/developers)

---

**🎉 You're all set!** Your HubSpot → Mixpanel integration is now ready to sync contact data and page view analytics automatically. 