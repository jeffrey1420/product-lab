# EU AI Act Compliance Checklist for Critical Infrastructure AI

**Use this checklist when deploying AI systems in energy, water, healthcare, communications, or transport sectors (EU AI Act Annex III high-risk AI systems).**

**Last updated:** June 3, 2026  
**Applicable regulation:** EU AI Act (Regulation 2024/1689), in force August 2026

---

## Before You Begin: Are You High-Risk?

Complete this before starting the checklist.

**Your AI system is likely high-risk if it:**
- Is used in energy, water, healthcare, communications, or transport infrastructure
- Makes or meaningfully influences decisions that affect safety or critical operations
- Processes data about individuals in ways that affect their rights
- Is used for cybersecurity purposes in a critical infrastructure context

If you are deploying Anthropic Mythos in a French energy, water, healthcare, or communications company: **yes, you are high-risk.**

---

## Phase 1: Pre-Deployment (Weeks 1-4)

### 1.1 High-Risk Classification Assessment

- [ ] Document the intended purpose of the AI system
- [ ] Map the AI system to the correct Annex III category
- [ ] Assess whether the system makes or meaningfully influences decisions
- [ ] Produce a written High-Risk Classification Statement
- [ ] Have legal counsel review the classification decision

**Output:** High-Risk Classification Statement (internal document)

### 1.2 Data Governance (Annex I, Article 10)

- [ ] Document all training data used (relevance, biases, coverage gaps)
- [ ] Document data governance measures in place during operation
- [ ] Assess whether training data contains personal data and establish lawful basis
- [ ] Implement data quality and data protection measures
- [ ] Produce a Data Governance Document

**Output:** Data Governance Document

### 1.3 Technical Documentation (Article 11)

- [ ] Describe the AI system's functionality and intended purpose
- [ ] Document the system architecture and components
- [ ] Document the design choices made and their rationale
- [ ] Include descriptions of hardware, software, model versions
- [ ] Document known limitations, out-of-scope use cases
- [ ] Specify update and version control procedures

**Output:** Technical Documentation file (Article 11)

### 1.4 Conformity Assessment (Article 43)

- [ ] Conduct internal gap analysis against all Annex I requirements
- [ ] Assess against Chapter III requirements: data governance, technical documentation, record-keeping, transparency, human oversight, accuracy/robustness/cybersecurity
- [ ] For lower-risk Annex III: self-assessment with documented rationale
- [ ] For higher-risk (critical infrastructure cybersecurity): engage a Notified Body or produce a comprehensive internal assessment with third-party review
- [ ] Produce a Conformity Assessment Report
- [ ] Sign the EU Declaration of Conformity (Article 48)

**Output:** Conformity Assessment Report + EU Declaration of Conformity

---

## Phase 2: Registration (Week 2-3)

### 2.1 EU Database Registration (Article 51)

- [ ] Access the EU database (operated by the Commission)
- [ ] Register the AI system before going live with the public authority
- [ ] Include: system name, description, intended purpose, risk category
- [ ] Include: provider name and contact details (Anthropic as upstream provider; deployer as responsible party)
- [ ] Include: conformity assessment body (if applicable)
- [ ] Include: basic technical specifications
- [ ] Receive unique registration number
- [ ] Place registration number in the system's technical documentation

**Output:** EU Database Registration Number

### 2.2 Transparency and User Information (Article 13)

- [ ] Prepare user-facing documentation (not just technical docs)
- [ ] Describe: how to use the system correctly
- [ ] Describe: known limitations and out-of-scope use cases
- [ ] Describe: update procedures and version management
- [ ] For AI systems that interact with humans: disclose that it is an AI system (Article 13)
- [ ] For Mythos specifically: document the human review step required before action is taken on vulnerability findings

**Output:** User Documentation / Instructions for Use

---

## Phase 3: Human Oversight (Week 3-4)

### 3.1 Human Oversight Framework (Article 14)

- [ ] Define who has authority over the AI system's outputs
- [ ] Document the human review process for each output type
- [ ] For Mythos: define the review workflow before patching based on Mythos findings
- [ ] Define escalation paths (who decides if Mythos flags a critical vuln at 2am?)
- [ ] Document how humans can override AI recommendations
- [ ] Document the process for handling false positives (Mythos flags a non-vulnerability)
- [ ] Test the oversight framework with real scenarios
- [ ] Produce a Human Oversight Plan

**Output:** Human Oversight Plan (Article 14 compliance document)

### 3.2 Accuracy, Robustness, and Cybersecurity (Article 15)

- [ ] Establish accuracy metrics relevant to the system's purpose
- [ ] Test the system against relevant benchmarks
- [ ] Document the system's known accuracy limitations
- [ ] Establish cybersecurity measures (input validation, access controls, logging)
- [ ] For Mythos: document what happens if Mythos is compromised or produces adversarial outputs
- [ ] Produce an Accuracy and Robustness Report

**Output:** Accuracy and Robustness Report

---

## Phase 4: Audit and Logging (Week 4+)

### 4.1 Record-Keeping (Article 12)

- [ ] Implement automatic logging of all system inputs and outputs
- [ ] Ensure logs are tamper-resistant (cryptographic integrity)
- [ ] Log: what the AI system processed, what it output, what action was taken
- [ ] Log: who reviewed the output, when, and what they decided
- [ ] Define log retention period (minimum 6 months; critical infrastructure = longer recommended)
- [ ] Ensure logs are accessible to authorities on request
- [ ] Test log retrieval and readability

**Output:** Audit Log System + Log Retention Policy

### 4.2 Incident Response (Article 72)

- [ ] Define what constitutes a "serious incident" for your AI system
- [ ] Establish internal escalation procedure for serious incidents
- [ ] Prepare incident report template (describe AI system, nature of incident, mitigation measures)
- [ ] Identify the relevant market surveillance authority for your sector
- [ ] Establish reporting timeline (serious incidents must be reported "without undue delay" and at least within 3 days of becoming aware)
- [ ] Produce a Serious Incident Response Protocol

**Output:** Serious Incident Response Protocol + Report Template

---

## Phase 5: Ongoing Compliance (Continuous)

### 5.1 Post-Market Monitoring (Article 9)

- [ ] Establish a post-market monitoring system
- [ ] Track real-world system performance vs. expected performance
- [ ] Capture user feedback and complaints
- [ ] Monitor for new risks or misuse patterns
- [ ] Update the Conformity Assessment if significant changes occur
- [ ] Quarterly: produce a Post-Market Monitoring Report

**Output:** Quarterly Post-Market Monitoring Report

### 5.2 Model Update Assessment (Ongoing)

- [ ] Track when the AI system provider (e.g., Anthropic) updates the model
- [ ] Assess whether each update constitutes a "significant change" to the system
- [ ] If significant change: re-run conformity assessment, update EU database registration
- [ ] For Mythos: document every model update received and its compliance impact

**Output:** Model Update Log + Significant Change Assessment

### 5.3 Annual EU AI Act Health Check

- [ ] Re-review all Annex I and Chapter III requirements
- [ ] Update technical documentation with any changes
- [ ] Verify the EU database registration is current
- [ ] Review and update human oversight procedures
- [ ] Review audit log retention and accessibility
- [ ] Produce an Annual Compliance Attestation

**Output:** Annual Compliance Attestation

---

## Critical Infrastructure AI-Specific Notes

### For Cybersecurity AI (Mythos, Vibe Work Security Mode, etc.)

- The "human oversight" requirement is especially critical — automated patching based on AI findings without human review is not EU AI Act compliant
- Audit logs must capture: vulnerability found → human reviewed → action taken/approved
- Serious incident definition should include: AI-assisted decision that led to a security breach or false positive that caused operational disruption
- CNIL and ANSSI may both have jurisdiction depending on the data processed

### For French Companies Specifically

- **CNIL** has authority over personal data processing aspects
- **ANSSI** has authority over cybersecurity system aspects
- **DGEC** (Directorate General for Energy and Climate) may have authority for energy sector
- Registration with the EU database is through the Commission but national authorities may require notification
- The French national AI ethics body (CNEA) may issue guidance relevant to your sector

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | June 3, 2026 | Jeffrey (Product-Lab) | Initial version |

**This checklist is provided for informational purposes. It does not constitute legal advice. Consult qualified legal counsel before deploying high-risk AI systems under the EU AI Act.**

---

*Part of the Alizé product-lab research initiative*  
*github.com/jeffrey1420/product-lab*
