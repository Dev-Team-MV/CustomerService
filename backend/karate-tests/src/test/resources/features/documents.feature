@wide
Feature: Documents API

  Background:
    * def auth = call read('classpath:helpers/auth.feature')
    * def authToken = auth.authToken
    * url baseUrl
    * header Authorization = 'Bearer ' + authToken

  Scenario: List documents
    Given path 'api', 'documents'
    And param projectId = projectId
    When method get
    Then status 200

  Scenario: Search documents
    Given path 'api', 'documents', 'search'
    And param projectId = projectId
    When method get
    Then status 200

  Scenario: Expiring documents
    Given path 'api', 'documents', 'expiring'
    When method get
    Then status 200
