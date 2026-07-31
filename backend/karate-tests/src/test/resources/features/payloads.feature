@wide
Feature: Payloads API

  Background:
    * def auth = call read('classpath:helpers/auth.feature')
    * def authToken = auth.authToken
    * url baseUrl
    * header Authorization = 'Bearer ' + authToken

  Scenario: List payloads
    Given path 'api', 'payloads'
    And param projectId = projectId
    When method get
    Then status 200

  Scenario: Payload stats
    Given path 'api', 'payloads', 'stats'
    When method get
    Then status 200
