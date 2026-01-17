🛡 **SAST** **Security** **Report** **-** **StreamSphere**
**Application**

**Project:** StreamSphere

**Scan** **Date:** January 17, 2026

**Scan** **Tool:** GitLab SAST (Semgrep) **Scan** **Duration:** 17
seconds

**Files** **Scanned:** 81

**Report** **Generated** **By:** GitLab CI/CD Pipeline \#2269080312

📊 **Executive** **Summary**

> **Severity**
>
> 🔴 **Critical**
>
> 🟠 **High**
>
> 🟡 **Medium**
>
> 🟢 **Low**
>
> 🔵 **Info**
>
> **Total**

**Count** **Status**

**5** ⚠ **Requires** **Immediate** **Action**

**3** ⚠ **Fix** **Before** **Production**

**11** ⚙ **Plan** **Remediation**

**0** ✅ **None** **Found**

**0** ✅ **None** **Found**

**19**

**Risk** **Assessment**

> **Overall** **Risk** **Level:** 🔴 **HIGH**
>
> **Production** **Readiness:** ❌ **NOT** **RECOMMENDED** until
> Critical issues are resolved
>
> **Compliance** **Impact:** May violate OWASPTop 10 security standards

🔴 **Critical** **Vulnerabilities** **(5)**

**1.** **NoSQL** **Injection** **in** **Media** **Routes**

> **File:** server/routes/mediaRoutes.js
>
> **Lines:** 113-116
>
> **CWE:** CWE-943
>
> **OWASP:**A03:2021 - Injection

**Description:**

Untrusted user input in findOne() function can result in NoSQL
Injection.

**Impact:**

> Attackers can bypass authentication
>
> Unauthorized access to database records
>
> Data exfiltration or manipulation
>
> Potential complete database compromise

**Recommendation:**

> javascript
>
> *//* *Before* *(Vulnerable)*
>
> const media = await Media.findOne({ \_id: req.params.id });
>
> *//* *After* *(Secure)*
>
> if (!mongoose.Types.ObjectId.isValid(req.params.id)) { return
> res.status(400).json({ error: 'Invalid ID' });
>
> }
>
> const media = await Media.findById(req.params.id);

**2.** **NoSQL** **Injection** **in** **Genre** **Routes**

> **File:** server/routes/genreRoutes.js
>
> **Line:** 11
>
> **CWE:** CWE-943
>
> **OWASP:**A03:2021 - Injection

**Description:**

Untrusted user input in findOne() function can result in NoSQL
Injection.

**Impact:**

> Same as above - database query manipulation

**Recommendation:**

> Implement input validation using express-validator
>
> Use express-mongo-sanitize middleware
>
> Validate ObjectId format before queries

**3.** **NoSQL** **Injection** **in** **Watchlist** **Routes**

> **File:** server/routes/watchlistRoutes.js
>
> **Lines:** 14-17
>
> **CWE:** CWE-943
>
> **OWASP:**A03:2021 - Injection

**Description:**

Untrusted user input in findOne() function can result in NoSQL
Injection.

**Impact:**

> User watchlist data exposure
>
> Unauthorized watchlist modifications
>
> Cross-user data access

**Recommendation:**

> Sanitize all user IDs and media IDs
>
> Implement proper authorization checks
>
> Use parameterized queries

**4.** **NoSQL** **Injection** **in** **User** **Routes**

> **File:** server/routes/userRoutes.js
>
> **Lines:** 26-39
>
> **CWE:** CWE-943
>
> **OWASP:**A03:2021 - Injection

**Description:**

Untrusted user input in findOne() function can result in NoSQL
Injection.

**Impact:**

> User account takeover
>
> Personal data exposure (PII)
>
> Authentication bypass
>
> Profile manipulation

**Recommendation:**

> Critical: Add immediate input sanitization
>
> Implement strict user ID validation
>
> Add authentication middleware validation

**5.** **NoSQL** **Injection** **in** **Continue** **Watching**
**Routes**

> **File:** server/routes/continueWatchingRoutes.js
>
> **Lines:** 9-39
>
> **CWE:** CWE-943
>
> **OWASP:**A03:2021 - Injection

**Description:**

Untrusted user input in findOne() function can result in NoSQL
Injection.

**Impact:**

> Viewing history manipulation
>
> User behavior tracking compromise
>
> Recommendation algorithm poisoning

**Recommendation:**

> Validate all user and media IDs
>
> Implement rate limiting
>
> Add input sanitization

🟠 **High** **Severity** **Vulnerabilities** **(3)**

**6.** **Server-Side** **Request** **Forgery** **(SSRF)** **-**
**Media** **Service**

> **File:** frontend/src/services/mediaService.js
>
> **Line:** 22
>
> **CWE:** CWE-918
>
> **OWASP:**A03:2021 - Injection

**Description:**

User-controlled URLs passed directly to HTTP client libraries can result
in Server-Side Request Forgery

(SSRF).

**Impact:**

> Access to internal network resources
>
> Cloud metadata service exploitation
>
> Port scanning of internal infrastructure
>
> Bypass firewall rules

**Recommendation:**

> javascript
>
> *//* *Use* *whitelist* *approach*
>
> constALLOWED_DOMAINS = \['api.streamsphere.com',
> 'cdn.streamsphere.com'\]; constAPI_BASE =
> process.env.REACT_APP_API_URL;
>
> *//* *Don't* *accept* *arbitrary* *URLs* *from* *users* export const
> fetchMedia = async (mediaId) =\> {
>
> const url = \`\${API_BASE}/\${mediaId}\`; return await
> axios.get(url);
>
> };

**7.** **Server-Side** **Request** **Forgery** **(SSRF)** **-**
**Watch** **History** **Service**

> **File:** frontend/src/services/watchHistoryService.js
>
> **Line:** 25
>
> **CWE:** CWE-918
>
> **OWASP:**A03:2021 - Injection

**Description:**

Same SSRF vulnerability in watch history service.

**Impact:**

> Same as above

**Recommendation:**

> Use hardcoded API base URLs
>
> Validate and sanitize all URL inputs
>
> Implement URL whitelist

**8.** **Server-Side** **Request** **Forgery** **(SSRF)** **-**
**Watchlist** **Service**

> **File:** frontend/src/services/watchlistService.js
>
> **Line:** 27
>
> **CWE:** CWE-918
>
> **OWASP:**A03:2021 - Injection

**Description:**

Same SSRF vulnerability in watchlist service.

**Impact:**

> Same as above

**Recommendation:**

> Consolidate API calls through a secure base URL
>
> Remove any user-controlled URL parameters

🟡 **Medium** **Severity** **Vulnerabilities** **(11)**

**9-11.** **Path** **Traversal** **in** **Stream** **Routes** **(3**
**instances)**

> **File:** server/routes/cache/streamRoutes.js
>
> **Lines:** 13, 22, 31
>
> **CWE:** CWE-22, CWE-23
>
> **OWASP:**A01:2021 - Broken Access Control

**Description:**

Dynamic file path construction with user input can lead to path
traversal attacks.

**Impact:**

> Access to sensitive files outside intended directory
>
> Read arbitrary files on server
>
> Information disclosure

**Recommendation:**

> javascript
>
> const path = require('path');
>
> *//* *Validate* *and* *normalize* *paths* const basePath =
> '/app/streams/';
>
> const safePath = path.normalize(path.join(basePath, userInput));
>
> if (!safePath.startsWith(basePath)) { throw new Error('Invalid path');
>
> }

**12.** **Non-literal** **Regular** **Expression**

> **File:** server/routes/searchRoutes.js
>
> **Line:** 11
>
> **CWE:** CWE-185
>
> **OWASP:**A03:2021 - Injection

**Description:**

RegExp constructor with non-literal value can cause ReDoS (Regular
Expression Denial of Service).

**Impact:**

> Application becomes unresponsive
>
> CPU exhaustion
>
> Service unavailability

**Recommendation:**

> javascript
>
> *//* *Use* *RE2* *library* *for* *safe* *regex* const RE2 =
> require('re2');
>
> const regex = new RE2(pattern);
>
> *//* *Or* *validate* *and* *limit* *regex* *complexity*

**13.** **Weak** **Random** **Number** **Generator**

> **File:** server/routes/authRoutes.js
>
> **Line:** 19
>
> **CWE:** CWE-338
>
> **OWASP:**A02:2021 - Cryptographic Failures

**Description:**

Using crypto.pseudoRandomBytes() or Math.random() for security-critical
operations.

**Impact:**

> Predictable tokens or session IDs
>
> Password reset token compromise
>
> Session hijacking
>
> Authentication bypass

**Recommendation:**

> javascript
>
> *//* *Use* *cryptographically* *secure* *random* const crypto =
> require('crypto');
>
> const secureToken = crypto.randomBytes(32).toString('hex');

**14-18.** **Layer** **7** **Denial** **of** **Service** **(5**
**instances)**

> **Files:**
>
> server/routes/videoRoutes.js (lines: 184, 197)
>
> server/routes/mediaRoutes.js (lines: 327, 402, 490)
>
> **CWE:** CWE-606
>
> **OWASP:**A05:2021 - Security Misconfiguration

**Description:**

Looping over user-controlled objects without limits can cause DoS.

**Impact:**

> CPU exhaustion
>
> Memory overflow
>
> Application crash
>
> Service unavailability

**Recommendation:**

> javascript
>
> *//* *Add* *limits* *to* *loops*
>
> const MAX_ITEMS = 100;
>
> const items = req.body.items.slice(0, MAX_ITEMS);
>
> for (let i = 0; i \< Math.min(items.length, MAX_ITEMS); i++) { *//*
> *Process* *item*
>
> }

**19.** **Relative** **Path** **Traversal**

> **File:** server/routes/cache/streamRoutes.js
>
> **Line:** 31
>
> **CWE:** CWE-23
>
> **OWASP:**A01:2021 - Broken Access Control

**Description:**

Untrusted user input in readFile() / readFileSync() can lead to
directory traversal.

**Impact:**

> Read sensitive configuration files
>
> Access environment variables
>
> Source code disclosure

**Recommendation:**

> javascript
>
> *//* *Validate* *file* *paths*
>
> const path = require('path');
>
> const basePath = path.resolve('./streams');
>
> const requestedPath = path.resolve(basePath, userInput);
>
> if (!requestedPath.startsWith(basePath)) { throw new Error('Access
> denied');
>
> }

🎯 **Remediation** **Plan**

**Immediate** **Actions** **(Priority** **1** **-** **This** **Week)**

**Install** **Security** **Dependencies:**

> bash
>
> npm install express-mongo-sanitize express-validator helmet
> express-rate-limit

**Apply** **Critical** **Fixes:**

> 1\. ✅ Fix all 5 NoSQL injection vulnerabilities
>
> 2\. ✅Add express-mongo-sanitize middleware
>
> 3\. ✅ Implement input validation with express-validator
>
> 4\. ✅ Replace weak crypto with crypto.randomBytes()

**Estimated** **Effort:** 8-16 hours

**Short-term** **Actions** **(Priority** **2** **-** **Next** **2**
**Weeks)**

**Fix** **High** **Severity** **Issues:**

> 1\. ✅ Refactor frontend services to use base URL
>
> 2\. ✅ Implement URL whitelist for API calls
>
> 3\. ✅ Remove user-controlled URL parameters
>
> 4\. ✅Add security headers with Helmet

**Estimated** **Effort:** 4-8 hours

**Medium-term** **Actions** **(Priority** **3** **-** **Next**
**Month)**

**Address** **Medium** **Severity** **Issues:**

> 1\. ✅ Fix path traversal vulnerabilities
>
> 2\. ✅Add rate limiting for DoS protection
>
> 3\. ✅ Implement request size limits
>
> 4\. ✅ Use RE2 for regex operations
>
> 5\. ✅ Normalize and validate all file paths

**Estimated** **Effort:** 8-12 hours

🔧 **Implementation** **Guide**

**Step** **1:** **Add** **Security** **Middleware**

**File:** server/server.js or server/app.js

> javascript
>
> const express = require('express');
>
> const mongoSanitize = require('express-mongo-sanitize'); const helmet
> = require('helmet');
>
> const rateLimit = require('express-rate-limit');
>
> const app = express();
>
> *//* *Security* *headers* app.use(helmet());
>
> *//* *Prevent* *NoSQL* *injection* app.use(mongoSanitize({
>
> replaceWith: '\_' }));
>
> *//* *Rate* *limiting*
>
> const limiter = rateLimit({
>
> windowMs: 15 \* 60 \* 1000, *//* *15* *minutes*
>
> max: 100 *//* *limit* *each* *IP* *to* *100* *requests* *per*
> *windowMs* });
>
> app.use('/api/', limiter);
>
> *//* *Request* *size* *limits* app.use(express.json({ limit: '10mb'
> }));
>
> app.use(express.urlencoded({ extended: true, limit: '10mb' }));

**Step** **2:** **Create** **Validation** **Middleware**

**File:** server/middleware/validation.js

> javascript
>
> const { param, body, validationResult } =
> require('express-validator'); const mongoose = require('mongoose');
>
> *//* *Validate* *MongoDB* *ObjectId* exports.validateObjectId = \[
>
> param('id').custom((value) =\> {
>
> if (!mongoose.Types.ObjectId.isValid(value)) { throw new
> Error('Invalid ID format');
>
> }
>
> return true; }),
>
> (req, res, next) =\> {
>
> const errors = validationResult(req); if (!errors.isEmpty()) {
>
> return res.status(400).json({ errors: errors.array() }); }
>
> next(); }
>
> \];
>
> *//* *Validate* *email* exports.validateEmail = \[
>
> body('email').isEmail().normalizeEmail(), (req, res, next) =\> {
>
> const errors = validationResult(req); if (!errors.isEmpty()) {
>
> return res.status(400).json({ errors: errors.array() }); }
>
> next(); }
>
> \];

**Step** **3:** **Update** **Route** **Files**

**Example:** server/routes/mediaRoutes.js

> javascript
>
> const { validateObjectId } = require('../middleware/validation');
> const mongoose = require('mongoose');
>
> *//* *Before* *(Line* *113-116* *-* *VULNERABLE)* router.get('/:id',
> async (req, res) =\> {
>
> const media = await Media.findOne({ \_id: req.params.id });
> res.json(media);
>
> });
>
> *//* *After* *(SECURE)*
>
> router.get('/:id', validateObjectId, async (req, res) =\> { try {
>
> const media = await Media.findById(req.params.id);
>
> if (!media) {
>
> return res.status(404).json({ error: 'Media not found' }); }
>
> res.json(media); } catch (error) {
>
> console.error('Error fetching media:', error); res.status(500).json({
> error: 'Server error' });
>
> } });

**Step** **4:** **Update** **Frontend** **Services**

**Example:** frontend/src/services/mediaService.js

> javascript
>
> *//* *Before* *(Line* *22* *-* *VULNERABLE)*
>
> export const fetchMedia = async (url) =\> { const response = await
> axios.get(url); return response.data;
>
> };
>
> *//* *After* *(SECURE)*
>
> constAPI_BASE_URL = process.env.REACT_APP_API_URL \|\|
> 'http://localhost:5000/api';
>
> export const fetchMediaById = async (mediaId) =\> { const url =
> \`\${API_BASE_URL}/\${mediaId}\`; const response = await
> axios.get(url);
>
> return response.data; };
>
> export const searchMedia = async (query) =\> { const url =
> \`\${API_BASE_URL}/search\`; const response = await
> axios.post(url, { query }); return response.data;
>
> };

📈 **Security** **Metrics**

**Before** **Remediation**

> **Vulnerabilities:** 19
>
> **Critical:** 5 (26%)
>
> **High:** 3 (16%)
>
> **Security** **Score:** 45/100 ⚠

**Target** **After** **Remediation**

> **Vulnerabilities:** 0
>
> **Critical:** 0 (0%)
>
> **High:** 0 (0%)
>
> **Security** **Score:** 95/100 ✅

🧪 **Testing** **Recommendations**

**Security** **Testing** **Checklist**

> <img src="./2mclk0dh.png"
> style="width:0.13108in;height:0.13108in" />Run SAST scan after fixes
>
> Perform penetration testing for NoSQL injection Test SSRF prevention
> with malicious URLs Verify rate limiting functionality
>
> Test path traversal prevention Validate input sanitization

**Automated** **Testing**

> bash
>
> *\#* *Re-run* *SAST* *after* *fixes* git add .
>
> git commit -m "fix: Security vulnerabilities remediation" git push
> origin fix/security-issues
>
> *\#* *GitLab* *CI/CD* *will* *automatically* *run* *SAST* *again*

📚 **References**

**OWASP** **Resources**

> [<u>OWASPTop 10 2021</u>](https://owasp.org/www-project-top-ten/)
>
> [<u>NoSQL Injection
> Prevention</u>](https://cheatsheetseries.owasp.org/cheatsheets/Injection_Prevention_Cheat_Sheet.html)
>
> [<u>SSRF
> Prevention</u>](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html)

**CWE** **References**

> [<u>CWE-943: NoSQL
> Injection</u>](https://cwe.mitre.org/data/definitions/943.html)
>
> [<u>CWE-918:
> SSRF</u>](https://cwe.mitre.org/data/definitions/918.html)
>
> [<u>CWE-22: Path
> Traversal</u>](https://cwe.mitre.org/data/definitions/22.html)
>
> [<u>CWE-338: Weak
> PRNG</u>](https://cwe.mitre.org/data/definitions/338.html)

**Tools** **Used**

> **GitLab** **SAST:** Static Application Security Testing
>
> **Semgrep:** Code scanning engine (v1.145.0)
>
> **Scanner** **Version:** 6.14.0

👥 **Team** **Assignments**

> **Vulnerability** **Type**
>
> NoSQL Injection (5)
>
> SSRF (3)
>
> Path Traversal (3)
>
> Weak Crypto (1)
>
> DoS Protection (5)
>
> RegExp DoS (1)

**Assigned** **To**

Backend Team

Frontend Team

Backend Team

Security Team

DevOps Team

Backend Team

**Deadline**

Week 1

Week 2

Week 3

Week 1

Week 3

Week 2

**Status**

🔴 Pending

🔴 Pending

🟡 Planned

🔴 Pending

🟡 Planned

🟡 Planned

🔒 **Compliance** **Impact**

**Standards** **Affected**

> ✅ **OWASPTop** **10:** Multiple violations (A01, A02, A03, A05)
>
> ✅ **PCI** **DSS:** Input validation requirements
>
> ✅ **GDPR:** Data protection concerns
>
> ✅ **SOC** **2:** Security control gaps

**Recommendations** **for** **Compliance**

> 1\. Implement all Critical and High fixes before production
>
> 2\. Establish regular security scanning schedule
>
> 3\. Document all security controls
>
> 4\. Train development team on secure coding

📞 **Contact** **&** **Support**

**Security** **Team** **Lead:** \[Your Name\] **Email:**
[<u>security@streamsphere.com</u>](mailto:security@streamsphere.com)
**Slack** **Channel:** \#security-alerts

**For** **Questions:**

> Create issue in GitLab: StreamSphere/security-issues
>
> Tag: @security-team in merge requests
>
> Emergency: Contact DevOps on-call

📋**Appendix**

**A.** **Complete** **Vulnerability** **List**

> **\#** **Severity**
>
> 1 Critical
>
> 2 Critical
>
> 3 Critical
>
> 4 Critical
>
> 5 Critical
>
> 6 High
>
> 7 High
>
> 8 High
>
> 9 Medium
>
> 10 Medium
>
> 11 Medium
>
> 12 Medium
>
> 13 Medium
>
> 14 Medium
>
> 15 Medium
>
> 16 Medium
>
> 17 Medium
>
> 18 Medium

**File**

mediaRoutes.js

genreRoutes.js

watchlistRoutes.js

userRoutes.js

continueWatchingRoutes.js

mediaService.js

watchHistoryService.js

watchlistService.js

streamRoutes.js

streamRoutes.js

streamRoutes.js

searchRoutes.js

authRoutes.js

videoRoutes.js

videoRoutes.js

mediaRoutes.js

mediaRoutes.js

mediaRoutes.js

**Line**

113-116

11

14-17

26-39

9-39

22

25

27

13

22

31

11

19

184

197

327

402

490

**Type** **CWE**

NoSQL Injection 943

NoSQL Injection 943

NoSQL Injection 943

NoSQL Injection 943

NoSQL Injection 943

SSRF 918

SSRF 918

SSRF 918

Path Traversal 22

Path Traversal 22

Path Traversal 22/23

Non-literal RegExp 185

Weak PRNG 338

Layer 7 DoS 606

Layer 7 DoS 606

Layer 7 DoS 606

Layer 7 DoS 606

Layer 7 DoS 606

> **\#** **Severity**
>
> 19 Medium

**File**

streamRoutes.js

**Line** **Type** **CWE**

31 Path Traversal 23

**B.** **Environment** **Information**

**Scan** **Environment:**

> GitLab Version: Latest
>
> Runner: GitLab.com Shared Runners
>
> Node.js Version: 18-alpine
>
> Scanner: Semgrep 1.145.0
>
> Analyzer: 6.14.0

**Project** **Information:**

> Repository: StreamSphere
>
> Branch: FinalV3
>
> Commit: 11cbb251
>
> Pipeline: \#2269080312

**C.** **Changelog**

> **Date**
>
> 2026-01-17

**Version**

1.0

**Changes**

Initial SAST scan report

**Report** **End**

*This* *report* *is* *confidential* *and* *intended* *for* *internal*
*use* *only.* *Do* *not* *distribute* *outside* *the* *organization.*
