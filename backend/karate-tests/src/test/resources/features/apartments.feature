@wide
Feature: Apartments API

  Background:
    * def auth = call read('classpath:helpers/auth.feature')
    * def authToken = auth.authToken
    * url baseUrl
    * header Authorization = 'Bearer ' + authToken

  Scenario: List apartments
    Given path 'api', 'apartments'
    And param projectId = projectId
    When method get
    Then status 200

  Scenario: Apartment stats
    Given path 'api', 'apartments', 'stats'
    And param projectId = projectId
    When method get
    Then status 200
