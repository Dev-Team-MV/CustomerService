@wide
Feature: CRM API

  Background:
    * def auth = call read('classpath:helpers/auth.feature')
    * def authToken = auth.authToken
    * url baseUrl
    * header Authorization = 'Bearer ' + authToken

  Scenario: CRM search
    Given path 'api', 'crm', 'search'
    And param q = 'ac'
    When method get
    Then status 200

  Scenario: CRM audit
    Given path 'api', 'crm', 'audit'
    When method get
    Then status 200

  Scenario: CRM agents
    Given path 'api', 'crm', 'agents'
    When method get
    Then status 200

  Scenario: CRM clients
    Given path 'api', 'crm', 'clients'
    When method get
    Then status 200

  Scenario: CRM payments
    Given path 'api', 'crm', 'payments'
    When method get
    Then status 200

  Scenario: CRM payments summary
    Given path 'api', 'crm', 'payments', 'summary'
    When method get
    Then status 200

  Scenario: CRM balance
    Given path 'api', 'crm', 'balance'
    When method get
    Then status 200

  Scenario: CRM notifications
    Given path 'api', 'crm', 'notifications'
    When method get
    Then status 200

  Scenario: CRM notifications count
    Given path 'api', 'crm', 'notifications', 'count'
    When method get
    Then status 200

  Scenario: CRM leads
    Given path 'api', 'crm', 'leads'
    And param projectId = projectId
    When method get
    Then status 200

  Scenario: CRM appointments
    Given path 'api', 'crm', 'appointments'
    When method get
    Then status 200

  Scenario: CRM automations
    Given path 'api', 'crm', 'automations'
    When method get
    Then status 200

  Scenario: CRM campaigns
    Given path 'api', 'crm', 'campaigns'
    When method get
    Then status 200
